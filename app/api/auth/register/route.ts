import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { RegisterSchema } from "@/lib/schemas/auth.schema";
import { PreferredGenderRule, SleepCycle, DietHabit, CleanlinessHabit, SmokingHabit, StudyHabit } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input fields",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      fullName,
      gender,
      campus,
      course,
      yearOfStudy,
      currentTerm,
      affiliation,
    } = parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_TAKEN",
            message: "An account with this email already exists.",
          },
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create User, Profile, and Baseline Preference in an atomic transaction
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        studentProfile: {
          create: {
            fullName,
            gender,
            campus,
            course,
            yearOfStudy,
            currentTerm,
            affiliation,
            studentIdPrefix: `${campus === "GEHU" ? "GEHU" : "GEU"}-${course.split(" ")[0] || "STU"}-2024`,
            avatarUrl:
              gender === "FEMALE"
                ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
                : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
            bio: `${yearOfStudy} student studying ${course} at ${affiliation}.`,
            roommatePreference: {
              create: {
                isLive: true,
                preferredGender: PreferredGenderRule.SAME_GENDER_ONLY,
                budgetMin: 7000,
                budgetMax: 9500,
                targetLocations: ["Bell Road PGs", "Subhash Nagar Flats"],
                sleepCycle: SleepCycle.EARLY_BIRD,
                diet: DietHabit.PURE_VEGETARIAN,
                cleanliness: CleanlinessHabit.DAILY_HIGH,
                smoking: SmokingHabit.NON_SMOKER,
                studyHabit: StudyHabit.QUIET_ALONE,
                hobbies: ["Coding", "Badminton"],
              },
            },
          },
        },
      },
      include: {
        studentProfile: {
          include: {
            roommatePreference: true,
          },
        },
      },
    });

    // Create session and set cookie
    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = req.headers.get("x-forwarded-for") || undefined;
    const { rawToken, expiresAt } = await createSession(newUser.id, {
      userAgent,
      ipAddress,
    });

    await setSessionCookie(rawToken, expiresAt);

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
          },
          studentProfile: newUser.studentProfile,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to register student account",
        },
      },
      { status: 500 }
    );
  }
}
