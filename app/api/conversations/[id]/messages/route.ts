import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { formatChatTime } from "@/lib/utils/date";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // Verify participation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: session.userId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You are not a participant in this conversation" } },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    // Mark unread messages sent by the other party as read upon viewing
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: session.userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: session.userId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      sender: m.senderId === session.userId ? ("me" as const) : ("them" as const),
      senderId: m.senderId,
      text: m.text,
      time: formatChatTime(m.createdAt),
      createdAt: m.createdAt.toISOString(),
      isDelivered: m.isDelivered,
      isRead: m.isRead,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Fetch Messages Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch messages" } },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Message text is required" } },
        { status: 400 }
      );
    }

    // Verify participation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: session.userId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Not a participant in this conversation" } },
        { status: 403 }
      );
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.userId,
        text,
        isDelivered: true,
      },
    });

    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        conversationId: message.conversationId,
        sender: "me",
        senderId: message.senderId,
        text: message.text,
        time: formatChatTime(message.createdAt),
        createdAt: message.createdAt.toISOString(),
        isDelivered: true,
        isRead: false,
      },
    });
  } catch (error) {
    console.error("Send Message Fallback Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to send message" } },
      { status: 500 }
    );
  }
}
