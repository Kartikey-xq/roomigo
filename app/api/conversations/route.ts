import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";


export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
      { status: 401 }
    );
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: session.userId, isArchived: false },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            include: {
              studentProfile: {
                include: { roommatePreference: true },
              },
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  const formatted = conversations.map((conv) => {
    const otherParticipant = conv.participants.find(
      (p) => p.userId !== session.userId
    );
    const myParticipant = conv.participants.find(
      (p) => p.userId === session.userId
    );

    const otherProfile = otherParticipant?.user.studentProfile;
    const lastMsg = conv.messages[0] || null;

    return {
      id: conv.id,
      otherUser: {
        id: otherParticipant?.userId || "",
        name: otherProfile?.fullName || "Student",
        avatar: otherProfile?.avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
        isVerified: otherProfile?.verificationStatus === "VERIFIED",
        studentIdPrefix: otherProfile?.studentIdPrefix || "GEHU",
        college: otherProfile?.campus?.includes("GEHU") ? "GEHU" : "GEU",
        course: otherProfile?.course || "Student",
        year: otherProfile?.yearOfStudy || "2nd Year",
        isOnline: true,
        lookingFor: otherProfile?.roommatePreference?.targetLocations[0] || "Dehradun",
        bio: otherProfile?.bio || "",
        preferences: otherProfile?.roommatePreference
          ? {
              sleepCycle: otherProfile.roommatePreference.sleepCycle,
              diet: otherProfile.roommatePreference.diet,
              cleanliness: otherProfile.roommatePreference.cleanliness,
              smoking: otherProfile.roommatePreference.smoking,
              budget: `₹${otherProfile.roommatePreference.budgetMin} - ₹${otherProfile.roommatePreference.budgetMax}`,
              hobbies: otherProfile.roommatePreference.hobbies,
            }
          : null,
      },
      lastMessage: lastMsg
        ? {
            text: lastMsg.text,
            time: new Date(lastMsg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            senderId: lastMsg.senderId,
            isMe: lastMsg.senderId === session.userId,
            isDelivered: lastMsg.isDelivered,
            isRead: lastMsg.isRead,
          }
        : null,
      updatedAt: conv.lastMessageAt,
      isMuted: myParticipant?.isMuted || false,
    };
  });

  // Guarantee strict single-conversation uniqueness per peer student
  const seenOtherUsers = new Set<string>();
  const uniqueConversations = formatted.filter((c) => {
    if (!c.otherUser.id) return false;
    if (seenOtherUsers.has(c.otherUser.id)) return false;
    seenOtherUsers.add(c.otherUser.id);
    return true;
  });

  return NextResponse.json({
    success: true,
    data: uniqueConversations,
  });
}
