import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

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
    const action = body.action as "CLEAR_CHAT" | "UNMATCH";

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

    if (action === "CLEAR_CHAT") {
      await prisma.message.deleteMany({
        where: { conversationId: id },
      });
      return NextResponse.json({
        success: true,
        message: "Conversation history cleared successfully",
      });
    }

    if (action === "UNMATCH") {
      // Find the other participant
      const other = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: id,
          userId: { not: session.userId },
        },
      });

      await prisma.$transaction(async (tx) => {
        // Delete messages and conversation
        await tx.message.deleteMany({ where: { conversationId: id } });
        await tx.conversationParticipant.deleteMany({ where: { conversationId: id } });
        await tx.conversation.delete({ where: { id } });

        // Update any requests between them to DECLINED or CANCELLED
        if (other) {
          await tx.roommateRequest.updateMany({
            where: {
              OR: [
                { senderId: session.userId, receiverId: other.userId },
                { senderId: other.userId, receiverId: session.userId },
              ],
            },
            data: { status: "DECLINED" },
          });
        }
      });

      return NextResponse.json({
        success: true,
        message: "Unmatched successfully. Conversation ended.",
      });
    }

    return NextResponse.json(
      { success: false, error: { code: "INVALID_ACTION", message: "Unknown action" } },
      { status: 400 }
    );
  } catch (error) {
    console.error("Conversation Action Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to perform action" } },
      { status: 500 }
    );
  }
}
