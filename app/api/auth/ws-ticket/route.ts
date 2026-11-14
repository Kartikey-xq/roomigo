import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import crypto from "crypto";

export async function POST() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Must be signed in to request a WebSocket connection ticket",
          },
        },
        { status: 401 }
      );
    }

    if (!session.user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACCOUNT_INACTIVE",
            message: "Student account is suspended or inactive",
          },
        },
        { status: 403 }
      );
    }

    // Generate cryptographically random short-lived ticket
    const ticket = `wst_${crypto.randomBytes(24).toString("base64url")}`;
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60 seconds TTL

    await prisma.webSocketTicket.create({
      data: {
        ticket,
        userId: session.userId,
        sessionId: session.id,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ticket,
        expiresInSeconds: 60,
      },
    });
  } catch (error) {
    console.error("WS Ticket Generation Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate WebSocket connection ticket",
        },
      },
      { status: 500 }
    );
  }
}
