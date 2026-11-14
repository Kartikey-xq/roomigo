import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";


export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        data: null,
      });
    }

    // Count pending received requests
    const pendingRequestsCount = await prisma.roommateRequest.count({
      where: {
        receiverId: session.userId,
        status: "PENDING",
      },
    });

    // Count unread messages across active conversations
    const unreadMessagesCount = await prisma.message.count({
      where: {
        conversation: {
          participants: {
            some: { userId: session.userId },
          },
        },
        senderId: { not: session.userId },
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: {
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
        },
        studentProfile: session.user.studentProfile,
        counts: {
          pendingRequests: pendingRequestsCount,
          unreadMessages: unreadMessagesCount,
        },
      },
    });
  } catch (error) {
    console.error("Session Check Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to verify session",
        },
      },
      { status: 500 }
    );
  }
}
