import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { ReportReason, Prisma } from "@prisma/client";


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
    const {
      reportedUserId,
      conversationId,
      reason,
      details,
      saveProof = true,
    } = body;

    if (!reportedUserId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "reportedUserId is required" } },
        { status: 400 }
      );
    }

    // Map UI reason string to Prisma enum
    let enumReason: ReportReason = ReportReason.OTHER;
    if (reason?.includes("Harassment")) enumReason = ReportReason.HARASSMENT_ABUSE;
    else if (reason?.includes("Fake Student")) enumReason = ReportReason.FAKE_STUDENT_ID;
    else if (reason?.includes("Scam")) enumReason = ReportReason.FINANCIAL_SCAM;
    else if (reason?.includes("Inappropriate")) enumReason = ReportReason.INAPPROPRIATE_BEHAVIOR;
    else if (reason?.includes("Spam")) enumReason = ReportReason.SPAM_COMMERCIAL;

    // Capture frozen chat evidence snapshot if conversationId provided
    let snapshot: Prisma.InputJsonValue | undefined = undefined;
    if (saveProof && conversationId) {
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      snapshot = messages.reverse().map((m) => ({
        id: m.id,
        senderId: m.senderId,
        text: m.text,
        sentAt: m.createdAt.toISOString(),
      })) as unknown as Prisma.InputJsonValue;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Create BlockReport
      await tx.blockReport.create({
        data: {
          reporterId: session.userId,
          reportedUserId,
          reason: enumReason,
          details: details || "Report filed by user",
          saveProof,
          chatEvidenceSnapshot: snapshot,
        },
      });

      // 2. Sever conversation if exists
      if (conversationId) {
        await tx.message.deleteMany({ where: { conversationId } });
        await tx.conversationParticipant.deleteMany({ where: { conversationId } });
        await tx.conversation.delete({ where: { id: conversationId } });
      }

      // 3. Update requests
      await tx.roommateRequest.updateMany({
        where: {
          OR: [
            { senderId: session.userId, receiverId: reportedUserId },
            { senderId: reportedUserId, receiverId: session.userId },
          ],
        },
        data: { status: "DECLINED" },
      });
    });

    return NextResponse.json({
      success: true,
      message:
        "Report and block recorded. Chat evidence snapshot securely archived for administrative review.",
    });
  } catch (error) {
    console.error("Report Block Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to submit report" } },
      { status: 500 }
    );
  }
}
