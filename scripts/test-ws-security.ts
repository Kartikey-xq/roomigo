import { WebSocket } from "ws";
import prisma from "../lib/db/prisma";
import { createSession } from "../lib/auth/session";
import crypto from "crypto";

const WS_BASE_URL = "ws://localhost:3001";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSecurityTestSuite() {
  console.log("=================================================");
  console.log("🛡️  STARTING WEBSOCKET SECURITY & TICKET TEST SUITE");
  console.log("=================================================");

  // 1. Setup Test Student and Session
  const student = await prisma.user.findFirst({
    where: { email: "kartikey@gehu.ac.in" },
  });

  if (!student) {
    throw new Error("Student kartikey@gehu.ac.in missing in PostgreSQL!");
  }

  const { session } = await createSession(student.id, {
    userAgent: "Security-Test-Runner/1.0",
    ipAddress: "127.0.0.1",
  });

  console.log(`✅ Loaded student: ${student.email} (${student.id})`);
  console.log(`✅ Created test session: ${session.id}`);

  // Helper to create ticket
  async function createTicket(opts?: {
    expiresInMs?: number;
    sessionId?: string;
    userId?: string;
  }) {
    const ticket = `wst_${crypto.randomBytes(24).toString("base64url")}`;
    const expiresAt = new Date(Date.now() + (opts?.expiresInMs ?? 60000));
    await prisma.webSocketTicket.create({
      data: {
        ticket,
        userId: opts?.userId ?? student!.id,
        sessionId: opts?.sessionId ?? session.id,
        expiresAt,
      },
    });
    return ticket;
  }

  // Helper to connect and wait for either open or error/close
  function attemptConnect(url: string, origin = "http://localhost:3000") {
    return new Promise<{ opened: boolean; error?: string; code?: number; ws: WebSocket }>((resolve) => {
      const ws = new WebSocket(url, { headers: { Origin: origin } });
      let resolved = false;

      ws.on("open", () => {
        if (!resolved) {
          resolved = true;
          resolve({ opened: true, ws });
        }
      });

      ws.on("error", (err) => {
        if (!resolved) {
          resolved = true;
          resolve({ opened: false, error: err.message, ws });
        }
      });

      ws.on("close", (code) => {
        if (!resolved) {
          resolved = true;
          resolve({ opened: false, code, ws });
        }
      });
    });
  }

  // ------------------------------------------------------------------
  // TEST CASE 1: Valid Ticket Connection & Atomic Consumption
  // ------------------------------------------------------------------
  console.log("\n--- TEST 1: Valid Single-Use Ticket Connection ---");
  const ticket1 = await createTicket();
  console.log(`Created ticket: ${ticket1}`);

  const res1 = await attemptConnect(`${WS_BASE_URL}?token=${encodeURIComponent(ticket1)}`);
  if (!res1.opened) {
    throw new Error(`TEST 1 FAILED: Could not connect with valid ticket! Error: ${res1.error}`);
  }
  console.log("✅ Handshake accepted: Valid ticket connected!");

  // Allow async DB atomic transition to finalize
  await wait(100);

  // Verify ticket is marked used in PostgreSQL
  const dbTicket1 = await prisma.webSocketTicket.findUnique({
    where: { ticket: ticket1 },
  });

  if (!dbTicket1 || dbTicket1.usedAt === null) {
    throw new Error("TEST 1 FAILED: Ticket usedAt was not set atomically in PostgreSQL!");
  }
  console.log(`✅ Ticket marked atomically used in DB at: ${dbTicket1.usedAt.toISOString()}`);

  res1.ws.close();
  await wait(300);

  // ------------------------------------------------------------------
  // TEST CASE 2: Replay Attack Protection
  // ------------------------------------------------------------------
  console.log("\n--- TEST 2: Replay Protection (Reusing Ticket) ---");
  console.log(`Attempting connection with already-consumed ticket: ${ticket1}`);

  const res2 = await attemptConnect(`${WS_BASE_URL}?token=${encodeURIComponent(ticket1)}`);
  if (res2.opened) {
    res2.ws.close();
    throw new Error("TEST 2 FAILED: Replayed ticket was accepted! Replay protection compromised.");
  }

  console.log(`✅ Replay rejected during handshake! Error: "${res2.error || res2.code}" (Expected 401 Unauthorized)`);
  if (!res2.error?.includes("401") && res2.code !== 4001) {
    throw new Error(`Expected rejection with 401, got error: ${res2.error}`);
  }

  // ------------------------------------------------------------------
  // TEST CASE 3: Expired Ticket Rejection
  // ------------------------------------------------------------------
  console.log("\n--- TEST 3: Expired Ticket Rejection ---");
  const expiredTicket = await createTicket({ expiresInMs: -5000 }); // expired 5s ago
  console.log(`Created expired ticket: ${expiredTicket}`);

  const res3 = await attemptConnect(`${WS_BASE_URL}?token=${encodeURIComponent(expiredTicket)}`);
  if (res3.opened) {
    res3.ws.close();
    throw new Error("TEST 3 FAILED: Expired ticket was accepted!");
  }

  console.log(`✅ Expired ticket rejected during handshake! Error: "${res3.error || res3.code}" (Expected 401)`);
  if (!res3.error?.includes("401") && res3.code !== 4001) {
    throw new Error(`Expected rejection with 401, got error: ${res3.error}`);
  }

  // ------------------------------------------------------------------
  // TEST CASE 4: Revoked Session Rejection
  // ------------------------------------------------------------------
  console.log("\n--- TEST 4: Revoked Session Ticket Rejection ---");
  const { session: revokedSession } = await createSession(student.id);
  // Revoke session in DB
  await prisma.session.update({
    where: { id: revokedSession.id },
    data: { revokedAt: new Date() },
  });

  const ticketForRevokedSession = await createTicket({ sessionId: revokedSession.id });
  console.log(`Created ticket bound to revoked session: ${ticketForRevokedSession}`);

  const res4 = await attemptConnect(`${WS_BASE_URL}?token=${encodeURIComponent(ticketForRevokedSession)}`);
  if (res4.opened) {
    res4.ws.close();
    throw new Error("TEST 4 FAILED: Ticket for revoked session was accepted!");
  }

  console.log(`✅ Revoked session ticket rejected! Error: "${res4.error || res4.code}" (Expected 401)`);
  if (!res4.error?.includes("401") && res4.code !== 4001) {
    throw new Error(`Expected rejection with 401, got error: ${res4.error}`);
  }

  // ------------------------------------------------------------------
  // TEST CASE 5: Unauthorized Origin Rejection
  // ------------------------------------------------------------------
  console.log("\n--- TEST 5: Unauthorized Origin Validation ---");
  const ticketForBadOrigin = await createTicket();
  console.log(`Connecting with forbidden origin: https://malicious-scam-site.com`);

  const res5 = await attemptConnect(
    `${WS_BASE_URL}?token=${encodeURIComponent(ticketForBadOrigin)}`,
    "https://malicious-scam-site.com"
  );

  if (res5.opened) {
    res5.ws.close();
    throw new Error("TEST 5 FAILED: Connection from unauthorized origin was accepted!");
  }

  console.log(`✅ Unauthorized origin rejected! Error: "${res5.error || res5.code}" (Expected 403 Forbidden)`);
  if (!res5.error?.includes("403") && res5.code !== 4003) {
    throw new Error(`Expected rejection with 403, got error: ${res5.error}`);
  }

  // ------------------------------------------------------------------
  // TEST CASE 6: Conversation Authorization (JOIN_ROOM & SEND_MESSAGE)
  // ------------------------------------------------------------------
  console.log("\n--- TEST 6: Conversation & Room Authorization ---");
  const ticket6 = await createTicket();
  const res6 = await attemptConnect(`${WS_BASE_URL}?token=${encodeURIComponent(ticket6)}`);
  if (!res6.opened) {
    throw new Error(`Could not connect for test 6: ${res6.error}`);
  }
  const ws6 = res6.ws;

  // Attempt to join a conversation ID where student is NOT a participant
  const fakeConversationId = "00000000-0000-0000-0000-000000000000";
  console.log(`Attempting unauthorized JOIN_ROOM on ${fakeConversationId}...`);

  const joinErrorPromise = new Promise<string>((resolve) => {
    ws6.on("message", (raw) => {
      const parsed = JSON.parse(raw.toString());
      if (parsed.type === "ERROR") resolve(parsed.message);
    });
  });

  ws6.send(JSON.stringify({ type: "JOIN_ROOM", conversationId: fakeConversationId }));
  const joinErrMsg = await joinErrorPromise;
  console.log(`✅ Unauthorized JOIN_ROOM rejected with error: "${joinErrMsg}"`);

  // Attempt unauthorized SEND_MESSAGE
  console.log(`Attempting unauthorized SEND_MESSAGE on ${fakeConversationId}...`);
  const sendErrorPromise = new Promise<string>((resolve) => {
    ws6.on("message", (raw) => {
      const parsed = JSON.parse(raw.toString());
      if (parsed.type === "ERROR") resolve(parsed.message);
    });
  });

  ws6.send(
    JSON.stringify({
      type: "SEND_MESSAGE",
      conversationId: fakeConversationId,
      text: "Hacked message",
    })
  );
  const sendErrMsg = await sendErrorPromise;
  console.log(`✅ Unauthorized SEND_MESSAGE rejected with error: "${sendErrMsg}"`);

  ws6.close();
  await wait(300);

  // ------------------------------------------------------------------
  // TEST CASE 7: Message Rate Limiting
  // ------------------------------------------------------------------
  console.log("\n--- TEST 7: WebSocket Message Rate Limiting ---");
  const ticket7 = await createTicket();
  const res7 = await attemptConnect(`${WS_BASE_URL}?token=${encodeURIComponent(ticket7)}`);
  if (!res7.opened) {
    throw new Error(`Could not connect for test 7: ${res7.error}`);
  }
  const ws7 = res7.ws;

  let rateLimitHit = false;
  ws7.on("message", (raw) => {
    const parsed = JSON.parse(raw.toString());
    if (parsed.type === "ERROR" && parsed.message.includes("Rate limit exceeded")) {
      rateLimitHit = true;
    }
  });

  // Rapidly spam 15 messages in < 100ms
  for (let i = 0; i < 15; i++) {
    ws7.send(JSON.stringify({ type: "TYPING", conversationId: fakeConversationId, isTyping: true }));
  }

  await wait(500);
  if (!rateLimitHit) {
    throw new Error("TEST 7 FAILED: Rate limit was not enforced during burst message spam!");
  }
  console.log("✅ Message rate limiter successfully triggered and throttled excess messages!");

  ws7.close();

  console.log("\n=================================================");
  console.log("🎉 ALL 7 WEBSOCKET SECURITY & TICKET TESTS PASSED!");
  console.log("=================================================\n");
}

runSecurityTestSuite()
  .catch((err) => {
    console.error("❌ Test Suite Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
