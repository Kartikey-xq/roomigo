import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { RequestStatus } from "@prisma/client";


export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
      { status: 401 }
    );
  }

  const [received, sent] = await Promise.all([
    prisma.roommateRequest.findMany({
      where: {
        receiverId: session.userId,
        status: RequestStatus.PENDING,
      },
      include: {
        sender: {
          include: {
            studentProfile: {
              include: { roommatePreference: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.roommateRequest.findMany({
      where: {
        senderId: session.userId,
      },
      include: {
        receiver: {
          include: {
            studentProfile: {
              include: { roommatePreference: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      received: received.map((r) => ({
        id: r.id,
        senderId: r.senderId,
        senderProfile: r.sender.studentProfile,
        requestMessage: r.requestMessage,
        createdAt: r.createdAt,
        status: r.status,
      })),
      sent: sent.map((r) => ({
        id: r.id,
        receiverId: r.receiverId,
        receiverProfile: r.receiver.studentProfile,
        requestMessage: r.requestMessage,
        createdAt: r.createdAt,
        status: r.status,
      })),
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { receiverId, requestMessage } = body;

    if (!receiverId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "receiverId is required" } },
        { status: 400 }
      );
    }

    if (receiverId === session.userId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "Cannot send request to yourself" } },
        { status: 400 }
      );
    }

    // Check if a request already exists between these two users
    const existing = await prisma.roommateRequest.findFirst({
      where: {
        OR: [
          { senderId: session.userId, receiverId },
          { senderId: receiverId, receiverId: session.userId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
        message: "Request already existed",
      });
    }

    const created = await prisma.roommateRequest.create({
      data: {
        senderId: session.userId,
        receiverId,
        requestMessage:
          requestMessage ||
          "Hey! Found your profile in roommate search and would love to connect.",
        status: RequestStatus.PENDING,
      },
    });

    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (error) {
    console.error("Create Request Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to send roommate request" } },
      { status: 500 }
    );
  }
}
