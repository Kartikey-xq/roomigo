import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { UpdatePreferenceSchema } from "@/lib/schemas/profile.schema";


export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
      { status: 401 }
    );
  }

  const preference = await prisma.roommatePreference.findFirst({
    where: { profile: { userId: session.userId } },
  });

  return NextResponse.json({
    success: true,
    data: preference,
  });
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = UpdatePreferenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid preference data",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Student profile not found" } },
        { status: 404 }
      );
    }

    const updated = await prisma.roommatePreference.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        ...parsed.data,
      },
      update: parsed.data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update Preference Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update preference" } },
      { status: 500 }
    );
  }
}
