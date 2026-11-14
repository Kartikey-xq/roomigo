import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import url from "url";
import prisma from "../lib/db/prisma";
import { hashToken } from "../lib/auth/session";

const PORT = parseInt(process.env.WS_PORT || "3001", 10);

interface AuthenticatedSocket extends WebSocket {
  userId: string;
  userEmail: string;
  rooms: Set<string>;
  isAlive: boolean;
}

const server = http.createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "Roomify WebSocket Server Running", port: PORT }));
});

const wss = new WebSocketServer({ server });

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

async function authenticateConnection(
  req: http.IncomingMessage
): Promise<{ id: string; email: string } | null> {
  const parsedUrl = url.parse(req.url || "", true);
  let token = parsedUrl.query.token as string | undefined;

  if (!token) {
    const cookies = parseCookie(req.headers.cookie);
    token = cookies["roomify_session"];
  }

  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }

  return { id: session.user.id, email: session.user.email };
}

wss.on("connection", async (ws: WebSocket, req: http.IncomingMessage) => {
  const user = await authenticateConnection(req);

  if (!user) {
    ws.close(4001, "Unauthorized");
    return;
  }

  const socket = ws as AuthenticatedSocket;
  socket.userId = user.id;
  socket.userEmail = user.email;
  socket.rooms = new Set<string>();
  socket.isAlive = true;

  // Track socket by user
  if (!userSockets.has(user.id)) {
    userSockets.set(user.id, new Set());
  }
  userSockets.get(user.id)!.add(socket);

  console.log(`🔌 [WS Connected] User ${user.email} (${user.id})`);

  socket.on("pong", () => {
    socket.isAlive = true;
  });

  socket.on("message", async (rawMessage: string) => {
    try {
      const data = JSON.parse(rawMessage.toString());

      switch (data.type) {
        case "JOIN_ROOM": {
          const { conversationId } = data;
          if (!conversationId) return;

          // Verify user belongs to conversation
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

          // Verify participation
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

          // Persist message in PostgreSQL
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

          const timeFormatted = new Date(savedMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          const broadcastPayload = {
            type: "NEW_MESSAGE",
            message: {
              id: savedMessage.id,
              conversationId,
              senderId: socket.userId,
              senderName: savedMessage.sender.studentProfile?.fullName || "Student",
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

          // Broadcast to room
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
    console.log(`🔌 [WS Disconnected] User ${socket.userEmail}`);
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
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    const socket = ws as AuthenticatedSocket;
    if (!socket.isAlive) return socket.terminate();
    socket.isAlive = false;
    socket.ping();
  });
}, 30000);

wss.on("close", () => {
  clearInterval(interval);
});

server.listen(PORT, () => {
  console.log(`🚀 Roomify WebSocket Server listening on ws://localhost:${PORT}`);
});
