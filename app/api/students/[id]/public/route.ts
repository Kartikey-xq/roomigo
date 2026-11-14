import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const student = await prisma.studentProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        roommatePreference: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Student profile not found" } },
        { status: 404 }
      );
    }

    // Sanitized response (no phone, no email)
    return NextResponse.json({
      success: true,
      data: {
        id: student.id,
        userId: student.userId,
        fullName: student.fullName,
        gender: student.gender,
        campus: student.campus,
        course: student.course,
        yearOfStudy: student.yearOfStudy,
        currentTerm: student.currentTerm,
        affiliation: student.affiliation,
        studentIdPrefix: student.studentIdPrefix,
        avatarUrl: student.avatarUrl,
        bio: student.bio,
        verificationStatus: student.verificationStatus,
        roommatePreference: student.roommatePreference
          ? {
              preferredGender: student.roommatePreference.preferredGender,
              budgetMin: student.roommatePreference.budgetMin,
              budgetMax: student.roommatePreference.budgetMax,
              targetLocations: student.roommatePreference.targetLocations,
              sleepCycle: student.roommatePreference.sleepCycle,
              diet: student.roommatePreference.diet,
              cleanliness: student.roommatePreference.cleanliness,
              smoking: student.roommatePreference.smoking,
              studyHabit: student.roommatePreference.studyHabit,
              hobbies: student.roommatePreference.hobbies,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Public Profile Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch student profile" } },
      { status: 500 }
    );
  }
}
