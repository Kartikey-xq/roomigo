import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import {
  evaluateCompatibility,
  MatchEvaluationCriteria,
  CandidateWithPreference,
} from "@/lib/matching/engine";
import {
  PreferredGenderRule,
  SleepCycle,
  DietHabit,
  CleanlinessHabit,
  Prisma,
} from "@prisma/client";


export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
        { status: 401 }
      );
    }

    const currentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.userId },
      include: { roommatePreference: true },
    });

    if (!currentProfile || !currentProfile.roommatePreference) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PROFILE_INCOMPLETE",
            message: "Please complete your student profile and living preferences first.",
          },
        },
        { status: 400 }
      );
    }

    // Optional override criteria from the CompatibilityFormModal
    const body = await req.json().catch(() => ({}));

    // Parse sleep cycle override
    let sleepCycle = currentProfile.roommatePreference.sleepCycle;
    if (body.sleepCycle) {
      if (body.sleepCycle.includes("Night Owl")) sleepCycle = SleepCycle.NIGHT_OWL;
      else if (body.sleepCycle.includes("Early Bird")) sleepCycle = SleepCycle.EARLY_BIRD;
      else sleepCycle = SleepCycle.FLEXIBLE;
    }

    // Parse diet override
    let diet = currentProfile.roommatePreference.diet;
    if (body.diet) {
      if (body.diet.includes("Pure Veg")) diet = DietHabit.PURE_VEGETARIAN;
      else if (body.diet.includes("Non-Veg")) diet = DietHabit.NON_VEGETARIAN;
      else if (body.diet.includes("Eggetarian")) diet = DietHabit.EGGETARIAN;
    }

    // Parse cleanliness override
    let cleanliness = currentProfile.roommatePreference.cleanliness;
    if (body.cleanliness) {
      if (body.cleanliness.includes("Daily")) cleanliness = CleanlinessHabit.DAILY_HIGH;
      else cleanliness = CleanlinessHabit.MODERATE_WEEKLY;
    }

    // Parse preferred gender rule
    let preferredGender = currentProfile.roommatePreference.preferredGender;
    if (body.preferredGender) {
      if (body.preferredGender.toLowerCase().includes("same gender")) {
        preferredGender = PreferredGenderRule.SAME_GENDER_ONLY;
      } else {
        preferredGender = PreferredGenderRule.ANY_GENDER;
      }
    }

    // Parse budget
    let budgetMin = currentProfile.roommatePreference.budgetMin;
    let budgetMax = currentProfile.roommatePreference.budgetMax;
    if (body.budget && typeof body.budget === "string") {
      const nums = body.budget.match(/\d+/g);
      if (nums && nums.length >= 2) {
        budgetMin = parseInt(nums[0] + "000", 10) || budgetMin;
        budgetMax = parseInt(nums[1] + "000", 10) || budgetMax;
      }
    }

    const evaluationCriteria: MatchEvaluationCriteria = {
      gender: currentProfile.gender,
      campus: body.campus || currentProfile.campus,
      course: body.course || currentProfile.course,
      preferredGender,
      sleepCycle,
      diet,
      cleanliness,
      budgetMin,
      budgetMax,
      targetLocations: body.location
        ? [body.location]
        : currentProfile.roommatePreference.targetLocations,
    };

    // Find any blocked users
    const blocks = await prisma.blockReport.findMany({
      where: {
        OR: [
          { reporterId: session.userId },
          { reportedUserId: session.userId },
        ],
      },
      select: { reportedUserId: true, reporterId: true },
    });

    const excludedUserIds = new Set<string>([session.userId]);
    blocks.forEach((b) => {
      excludedUserIds.add(b.reportedUserId);
      excludedUserIds.add(b.reporterId);
    });

    // Query active candidates
    const candidates = await prisma.studentProfile.findMany({
      where: {
        userId: { notIn: Array.from(excludedUserIds) },
        roommatePreference: {
          isLive: true,
        },
      },
      include: {
        roommatePreference: true,
      },
    });

    // Run matching algorithm
    const matchResults = candidates
      .map((c) =>
        evaluateCompatibility(
          evaluationCriteria,
          c as unknown as CandidateWithPreference
        )
      )
      .filter((res): res is NonNullable<typeof res> => res !== null)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Save scan history record
    await prisma.matchScanRecord.create({
      data: {
        userId: session.userId,
        searchParams: evaluationCriteria as unknown as Prisma.InputJsonValue,
        matchedCount: matchResults.length,
        topMatchScore: matchResults[0]?.matchPercentage || 0,
      },
    });

    // Format output matching UI Roommate contract
    const formattedMatches = matchResults.map((m) => {
      const c = m.candidate;
      return {
        id: c.userId,
        profileId: c.id,
        name: c.fullName,
        avatar: c.avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
        isVerified: c.verificationStatus === "VERIFIED",
        studentIdPrefix: c.studentIdPrefix || "GEHU-STUDENT",
        college: c.campus.includes("GEHU") ? "GEHU" : "GEU",
        course: c.course,
        year: c.yearOfStudy,
        matchPercentage: m.matchPercentage,
        matchHighlight: m.matchHighlight,
        lookingFor: c.roommatePreference?.targetLocations[0] || "Bell Road PGs",
        bio: c.bio || "",
        isOnline: true,
        scoreBreakdown: m.scoreBreakdown,
        preferences: {
          sleepCycle:
            c.roommatePreference?.sleepCycle === "EARLY_BIRD"
              ? "Early Bird (11pm - 6:30am)"
              : c.roommatePreference?.sleepCycle === "NIGHT_OWL"
              ? "Night Owl (2am - 9am)"
              : "Flexible Schedule",
          diet:
            c.roommatePreference?.diet === "PURE_VEGETARIAN"
              ? "Pure Vegetarian"
              : c.roommatePreference?.diet === "NON_VEGETARIAN"
              ? "Non-Vegetarian"
              : "Eggetarian",
          smoking: c.roommatePreference?.smoking || "Non-Smoker",
          studyHabit: c.roommatePreference?.studyHabit || "Quiet Study in Room",
          cleanliness:
            c.roommatePreference?.cleanliness === "DAILY_HIGH"
              ? "Cleans Daily & High Hygiene"
              : "Moderate Weekly Cleaning",
          budget: `₹${c.roommatePreference?.budgetMin.toLocaleString()} - ₹${c.roommatePreference?.budgetMax.toLocaleString()} /mo`,
          hobbies: c.roommatePreference?.hobbies || [],
        },
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedMatches.length,
      data: formattedMatches,
    });
  } catch (error) {
    console.error("Match Execution Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to run matching scan" } },
      { status: 500 }
    );
  }
}
