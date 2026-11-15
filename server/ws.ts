import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import url from "url";
import prisma from "../lib/db/prisma";
import { hashToken } from "../lib/auth/session";
import { formatChatTime } from "../lib/utils/date";

const PORT = parseInt(process.env.PORT || process.env.WS_PORT || "3001", 10);
const HOST = "0.0.0.0";
const MAX_PAYLOAD_BYTES = 64 * 1024; // 64 KB per message frame
const RATE_LIMIT_WINDOW_MS = 2000;
const MAX_MESSAGES_PER_WINDOW = 10;

interface AuthenticatedRequest extends http.IncomingMessage {
  authenticatedUser?: { id: string; email: string };
}

interface AuthenticatedSocket extends WebSocket {
  userId: string;
  userEmail: string;
  rooms: Set<string>;
  isAlive: boolean;
  messageTimestamps: number[];
}

const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url || "/").pathname;
  if (pathname === "/health" || pathname === "/" || pathname === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: "ok",
        service: "roomigo-ws",
        port: PORT,
        timestamp: new Date().toISOString(),
      })
    );
  }
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

// Map roomName -> Set of AuthenticatedSockets
const rooms = new Map<string, Set<AuthenticatedSocket>>();
// Map userId -> Set of AuthenticatedSockets (one user may have multiple tabs)
const userSockets = new Map<string, Set<AuthenticatedSocket>>();

function parseCookie(cookieString: string | undefined): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieString) return list;
  cookieString.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const key = parts[0]?.trim();
    const value = parts.slice(1).join("=").trim();
    if (key) list[key] = decodeURIComponent(value);
  });
  return list;
}

function validateOrigin(req: http.IncomingMessage): boolean {
  const origin = req.headers.origin;
  // Allow non-browser clients (testing scripts, automated verification, health checks)
  if (!origin) return true;

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        process.env.NEXT_PUBLIC_APP_URL || "",
      ].filter(Boolean);

  return allowedOrigins.includes(origin);
}

async function authenticateConnection(
  req: http.IncomingMessage
): Promise<{ id: string; email: string } | null> {
  const parsedUrl = url.parse(req.url || "", true);
  const token = parsedUrl.query.token as string | undefined;
  const now = new Date();

  // Primary Path: Single-use WebSocket ticket (?token=wst_...)
  if (token && token.startsWith("wst_")) {
    try {
      // Step 1: Pre-check ticket existence and validity for logging/audit
      const ticketRecord = await prisma.webSocketTicket.findUnique({
        where: { ticket: token },
        include: {
          session: true,
          user: true,
        },
      });

      if (!ticketRecord) {
        console.warn(`🔒 [WS Auth] Rejected: Unknown ticket`);
        return null;
      }

      if (ticketRecord.usedAt !== null) {
        console.warn(
          `🔒 [WS Auth] Replay Protection: Ticket already used at ${ticketRecord.usedAt.toISOString()}`
        );
        return null;
      }

      if (ticketRecord.expiresAt < now) {
        console.warn(
          `🔒 [WS Auth] Rejected: Ticket expired at ${ticketRecord.expiresAt.toISOString()}`
        );
        return null;
      }

      // Step 2: Atomic consumption transition (usedAt: null -> now)
      const claimResult = await prisma.webSocketTicket.updateMany({
        where: {
          ticket: token,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          usedAt: now,
        },
      });

      if (claimResult.count === 0) {
        // Race condition or concurrent replay attempt
        console.warn(`🔒 [WS Auth] Concurrent claim failed for ticket`);
        return null;
      }

      // Step 3: Validate bound session and student state against identical Next.js rules
      const { session, user } = ticketRecord;
      if (
        !session ||
        session.revokedAt !== null ||
        session.expiresAt < now ||
        !user ||
        !user.isActive
      ) {
        console.warn(
          `🔒 [WS Auth] Bound session is revoked, expired, or user is inactive`
        );
        return null;
      }

      return { id: user.id, email: user.email };
    } catch (err) {
      console.error("🔒 [WS Auth Ticket Error]:", err);
      return null;
    }
  }

  // Fallback Path: Direct session token (via roomify_session cookie in local/same-origin setups)
  let rawSessionToken: string | undefined = token;
  if (!rawSessionToken) {
    const cookies = parseCookie(req.headers.cookie);
    rawSessionToken = cookies["roomify_session"];
  }

  if (!rawSessionToken) return null;

  try {
    const tokenHash = hashToken(rawSessionToken);
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !session ||
      session.revokedAt !== null ||
      session.expiresAt < now ||
      !session.user ||
      !session.user.isActive
    ) {
      return null;
    }

    return { id: session.user.id, email: session.user.email };
  } catch (err) {
    console.error("🔒 [WS Auth Session Error]:", err);
    return null;
  }
}

// Instantiate WebSocketServer with handshake-level validation (verifyClient)
const wss = new WebSocketServer({
  server,
  maxPayload: MAX_PAYLOAD_BYTES,
  verifyClient: (info, callback) => {
    // 1. Origin Allowlist Validation
    if (!validateOrigin(info.req)) {
      console.warn(`🚫 [WS Handshake Rejected] Unauthorized Origin: ${info.req.headers.origin}`);
      return callback(false, 403, "Forbidden: Invalid Origin");
    }

    // 2. Authentication & Atomic Ticket Consumption
    authenticateConnection(info.req)
      .then((user) => {
        if (!user) {
          return callback(false, 401, "Unauthorized");
        }
        // Attach authenticated user identity to request object for connection handler
        (info.req as AuthenticatedRequest).authenticatedUser = user;
        callback(true);
      })
      .catch((err) => {
        console.error("verifyClient error:", err);
        callback(false, 500, "Internal Server Error");
      });
  },
});

wss.on("connection", (ws: WebSocket, req: http.IncomingMessage) => {
  const user = (req as AuthenticatedRequest).authenticatedUser;
  if (!user) {
    ws.close(4001, "Unauthorized");
    return;
  }

  const socket = ws as AuthenticatedSocket;
  socket.userId = user.id;
  socket.userEmail = user.email;
  socket.rooms = new Set<string>();
  socket.isAlive = true;
  socket.messageTimestamps = [];

  // Track socket by user (supports multi-tab browser sessions)
  if (!userSockets.has(user.id)) {
    userSockets.set(user.id, new Set());
  }
  userSockets.get(user.id)!.add(socket);

  console.log(`🔌 [WS Connected] Student ${user.email} (${user.id})`);

  socket.on("pong", () => {
    socket.isAlive = true;
  });

  socket.on("message", async (rawMessage: string) => {
    // 3. Message Rate Limiting
    const now = Date.now();
    socket.messageTimestamps = socket.messageTimestamps.filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW_MS
    );
    if (socket.messageTimestamps.length >= MAX_MESSAGES_PER_WINDOW) {
      socket.send(
        JSON.stringify({
          type: "ERROR",
          message: "Rate limit exceeded. Please slow down.",
        })
      );
      return;
    }
    socket.messageTimestamps.push(now);

    try {
      const data = JSON.parse(rawMessage.toString());

      switch (data.type) {
        case "JOIN_ROOM": {
          const { conversationId } = data;
          if (!conversationId) return;

          // Verify student belongs to this conversation
          const participant = await prisma.conversationParticipant.findUnique({
            where: {
              conversationId_userId: {
                conversationId,
                userId: socket.userId,
              },
            },
          });

          if (!participant) {
            socket.send(
              JSON.stringify({
                type: "ERROR",
                message: "Not a participant in this conversation",
              })
            );
            return;
          }

          const roomName = `room:${conversationId}`;
          socket.rooms.add(roomName);

          if (!rooms.has(roomName)) {
            rooms.set(roomName, new Set());
          }
          rooms.get(roomName)!.add(socket);

          socket.send(
            JSON.stringify({
              type: "ROOM_JOINED",
              conversationId,
            })
          );
          break;
        }

        case "SEND_MESSAGE": {
          const { conversationId, text, tempId } = data;
          if (!conversationId || !text || !text.trim()) return;

          // Verify participation before persisting
          const isParticipant = await prisma.conversationParticipant.findUnique({
            where: {
              conversationId_userId: {
                conversationId,
                userId: socket.userId,
              },
            },
          });

          if (!isParticipant) {
            socket.send(
              JSON.stringify({
                type: "ERROR",
                message: "Unauthorized to send message in this conversation",
              })
            );
            return;
          }

          // Persist message in PostgreSQL first
          const savedMessage = await prisma.message.create({
            data: {
              conversationId,
              senderId: socket.userId,
              text: text.trim(),
              isDelivered: true,
            },
            include: {
              sender: {
                include: { studentProfile: true },
              },
            },
          });

          // Update conversation timestamp
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
          });

          const timeFormatted = formatChatTime(savedMessage.createdAt);

          const broadcastPayload = {
            type: "NEW_MESSAGE",
            message: {
              id: savedMessage.id,
              conversationId,
              senderId: socket.userId,
              senderName:
                savedMessage.sender.studentProfile?.fullName || "Student",
              text: savedMessage.text,
              time: timeFormatted,
              createdAt: savedMessage.createdAt.toISOString(),
              isDelivered: true,
              isRead: false,
              tempId: tempId || null,
            },
          };

          // Send ACK back to sender
          socket.send(
            JSON.stringify({
              type: "MESSAGE_ACK",
              tempId,
              messageId: savedMessage.id,
              time: timeFormatted,
              createdAt: savedMessage.createdAt.toISOString(),
            })
          );

          // Broadcast to everyone in the room
          const roomName = `room:${conversationId}`;
          const clientsInRoom = rooms.get(roomName);
          if (clientsInRoom) {
            const rawPayload = JSON.stringify(broadcastPayload);
            clientsInRoom.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(rawPayload);
              }
            });
          }
          break;
        }

        case "MARK_READ": {
          const { conversationId } = data;
          if (!conversationId) return;

          // Update messages in DB
          await prisma.message.updateMany({
            where: {
              conversationId,
              senderId: { not: socket.userId },
              isRead: false,
            },
            data: {
              isRead: true,
              readAt: new Date(),
            },
          });

          // Update participant lastReadAt
          await prisma.conversationParticipant.update({
            where: {
              conversationId_userId: {
                conversationId,
                userId: socket.userId,
              },
            },
            data: { lastReadAt: new Date() },
          });

          // Broadcast read event to room
          const roomName = `room:${conversationId}`;
          const clientsInRoom = rooms.get(roomName);
          if (clientsInRoom) {
            const payload = JSON.stringify({
              type: "MESSAGES_READ",
              conversationId,
              readByUserId: socket.userId,
            });
            clientsInRoom.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
              }
            });
          }
          break;
        }

        case "TYPING": {
          const { conversationId, isTyping } = data;
          if (!conversationId) return;

          const roomName = `room:${conversationId}`;
          const clientsInRoom = rooms.get(roomName);
          if (clientsInRoom) {
            const payload = JSON.stringify({
              type: "USER_TYPING",
              conversationId,
              userId: socket.userId,
              isTyping: !!isTyping,
            });
            clientsInRoom.forEach((client) => {
              if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(payload);
              }
            });
          }
          break;
        }
      }
    } catch (err) {
      console.error("WS Message Error:", err);
    }
  });

  socket.on("close", () => {
    console.log(`🔌 [WS Disconnected] Student ${socket.userEmail}`);
    // Clean up rooms
    socket.rooms.forEach((roomName) => {
      const roomClients = rooms.get(roomName);
      if (roomClients) {
        roomClients.delete(socket);
        if (roomClients.size === 0) rooms.delete(roomName);
      }
    });

    // Clean up user tracking
    const userSocketsSet = userSockets.get(socket.userId);
    if (userSocketsSet) {
      userSocketsSet.delete(socket);
      if (userSocketsSet.size === 0) userSockets.delete(socket.userId);
    }
  });
});

// Heartbeat ping/pong every 30 seconds
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    const socket = ws as AuthenticatedSocket;
    if (!socket.isAlive) return socket.terminate();
    socket.isAlive = false;
    socket.ping();
  });
}, 30000);

wss.on("close", () => {
  clearInterval(heartbeatInterval);
});

// Graceful Shutdown Handler (SIGTERM / SIGINT)
let isShuttingDown = false;
async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n🛑 [WS Server] Received ${signal}. Initiating graceful shutdown...`);

  clearInterval(heartbeatInterval);

  // Close all active client connections cleanly
  wss.clients.forEach((client) => {
    client.close(1001, "Server shutting down");
  });

  wss.close(() => {
    console.log("🔒 [WS Server] WebSocket server closed to new connections.");
    server.close(async () => {
      console.log("🔒 [WS Server] HTTP listener stopped. Disconnecting Prisma...");
      try {
        await prisma.$disconnect();
        console.log("✅ [WS Server] Database disconnected cleanly.");
      } catch (err) {
        console.error("Error during database disconnect:", err);
      }
      process.exit(0);
    });
  });

  // Force exit if shutdown hangs beyond 5 seconds
  setTimeout(() => {
    console.error("⚠️ [WS Server] Forced shutdown after timeout.");
    process.exit(1);
  }, 5000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

server.listen(PORT, HOST, () => {
  console.log(
    `🚀 Roomify WebSocket Server listening on ws://${HOST}:${PORT} (Max Payload: ${MAX_PAYLOAD_BYTES / 1024}KB)`
  );
});
