import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { RequestStatus } from "@prisma/client";

export async function PATCH(
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
    const action = body.action as "ACCEPT" | "DECLINE";

    if (!action || !["ACCEPT", "DECLINE"].includes(action)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Action must be ACCEPT or DECLINE" } },
        { status: 400 }
      );
    }

    const request = await prisma.roommateRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Request not found" } },
        { status: 404 }
      );
    }

    // Only receiver can accept or decline
    if (request.receiverId !== session.userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only the recipient can respond to this invite" } },
        { status: 403 }
      );
    }

    if (action === "DECLINE") {
      const updated = await prisma.roommateRequest.update({
        where: { id },
        data: {
          status: RequestStatus.DECLINED,
          respondedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    // ACCEPT: Atomic Transaction to create Conversation & Participants
    const result = await prisma.$transaction(async (tx) => {
      const updatedReq = await tx.roommateRequest.update({
        where: { id },
        data: {
          status: RequestStatus.ACCEPTED,
          respondedAt: new Date(),
        },
      });

      // Enforce unique 1-to-1 conversation via canonical directKey
      const directKey = [request.senderId, request.receiverId].sort().join(":");

      let conversation = await tx.conversation.findUnique({
        where: { directKey },
        include: { participants: true },
      });

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            directKey,
            participants: {
              create: [
                { userId: request.senderId },
                { userId: request.receiverId },
              ],
            },
            messages: {
              create: [
                {
                  senderId: request.senderId,
                  text:
                    request.requestMessage ||
                    "Hey! Would love to connect about flatmate options.",
                  isDelivered: true,
                  isRead: false,
                },
              ],
            },
          },
          include: { participants: true },
        });
      }

      return { request: updatedReq, conversationId: conversation.id };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Chat invite accepted and conversation established!",
    });
  } catch (error) {
    console.error("Respond Request Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to respond to request" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const request = await prisma.roommateRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Request not found" } },
        { status: 404 }
      );
    }

    if (request.senderId !== session.userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only sender can cancel this request" } },
        { status: 403 }
      );
    }

    await prisma.roommateRequest.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Request cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel Request Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to cancel request" } },
      { status: 500 }
    );
  }
}
