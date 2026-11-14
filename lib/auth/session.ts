import crypto from "crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/db/prisma";

export const SESSION_COOKIE_NAME = "roomify_session";
const SESSION_DURATION_DAYS = 30;

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createSession(
  userId: string,
  meta?: { userAgent?: string; ipAddress?: string }
) {
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      userAgent: meta?.userAgent || null,
      ipAddress: meta?.ipAddress || null,
      expiresAt,
    },
  });

  return { session, rawToken, expiresAt };
}

export async function validateSessionToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          studentProfile: {
            include: {
              roommatePreference: true,
            },
          },
        },
      },
    },
  });

  if (!session) return null;
  if (session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function revokeSessionToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  try {
    await prisma.session.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  } catch {
    // Session might already be missing or deleted
  }
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  return validateSessionToken(sessionCookie.value);
}

export async function setSessionCookie(rawToken: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}
