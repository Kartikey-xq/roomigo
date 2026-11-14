import {
  Gender,
  PreferredGenderRule,
  SleepCycle,
  DietHabit,
  CleanlinessHabit,
} from "@prisma/client";

export interface CandidateWithPreference {
  id: string;
  userId: string;
  fullName: string;
  gender: Gender;
  campus: string;
  course: string;
  yearOfStudy: string;
  currentTerm: string;
  affiliation: string;
  studentIdPrefix: string | null;
  avatarUrl: string | null;
  bio: string | null;
  verificationStatus: string;
  roommatePreference: {
    isLive: boolean;
    preferredGender: PreferredGenderRule;
    budgetMin: number;
    budgetMax: number;
    targetLocations: string[];
    sleepCycle: SleepCycle;
    diet: DietHabit;
    cleanliness: CleanlinessHabit;
    smoking: string;
    studyHabit: string;
    hobbies: string[];
  } | null;
}

export interface MatchEvaluationCriteria {
  gender: Gender;
  campus: string;
  course: string;
  preferredGender: PreferredGenderRule;
  sleepCycle: SleepCycle;
  diet: DietHabit;
  cleanliness: CleanlinessHabit;
  budgetMin: number;
  budgetMax: number;
  targetLocations: string[];
}

export interface MatchResult {
  candidate: CandidateWithPreference;
  matchPercentage: number;
  matchHighlight: {
    icon: "zap" | "gamepad" | "leaf" | "sparkles" | "book";
    text: string;
  };
  scoreBreakdown: {
    sleep: number;
    diet: number;
    cleanliness: number;
    campusAndCourse: number;
    budget: number;
    location: number;
  };
}

export function evaluateCompatibility(
  userCriteria: MatchEvaluationCriteria,
  candidate: CandidateWithPreference
): MatchResult | null {
  const pref = candidate.roommatePreference;
  if (!pref || !pref.isLive) return null;

  // ==========================================
  // PHASE 1: HARD BINARY CONSTRAINTS
  // ==========================================

  // 1. Gender Rule (Mutual Check)
  // If User wants Same Gender Only, Candidate must be same gender
  if (
    userCriteria.preferredGender === PreferredGenderRule.SAME_GENDER_ONLY &&
    candidate.gender !== userCriteria.gender
  ) {
    return null; // Excluded
  }

  // If Candidate wants Same Gender Only, User must be same gender
  if (
    pref.preferredGender === PreferredGenderRule.SAME_GENDER_ONLY &&
    userCriteria.gender !== candidate.gender
  ) {
    return null; // Excluded
  }

  // ==========================================
  // PHASE 2: WEIGHTED ATTRIBUTE SCORING (100 PTS)
  // ==========================================

  // 1. Sleep Schedule (25 pts)
  let sleepScore = 0;
  if (userCriteria.sleepCycle === pref.sleepCycle) {
    sleepScore = 25;
  } else if (
    userCriteria.sleepCycle === SleepCycle.FLEXIBLE ||
    pref.sleepCycle === SleepCycle.FLEXIBLE
  ) {
    sleepScore = 18;
  } else {
    // Conflict: EARLY_BIRD vs NIGHT_OWL
    sleepScore = 0;
  }

  // 2. Dietary Habit (20 pts)
  let dietScore = 0;
  if (userCriteria.diet === pref.diet) {
    dietScore = 20;
  } else if (
    (userCriteria.diet === DietHabit.NON_VEGETARIAN && pref.diet === DietHabit.EGGETARIAN) ||
    (userCriteria.diet === DietHabit.EGGETARIAN && pref.diet === DietHabit.NON_VEGETARIAN)
  ) {
    dietScore = 18;
  } else if (
    (userCriteria.diet === DietHabit.PURE_VEGETARIAN && pref.diet === DietHabit.EGGETARIAN) ||
    (userCriteria.diet === DietHabit.EGGETARIAN && pref.diet === DietHabit.PURE_VEGETARIAN)
  ) {
    dietScore = 14;
  } else {
    // Pure Veg vs Non-Veg conflict
    dietScore = 5;
  }

  // 3. Cleanliness & Hygiene (20 pts)
  let cleanlinessScore = 0;
  if (userCriteria.cleanliness === pref.cleanliness) {
    cleanlinessScore = userCriteria.cleanliness === CleanlinessHabit.DAILY_HIGH ? 20 : 18;
  } else {
    cleanlinessScore = 10;
  }

  // 4. Campus & Course (15 pts)
  let campusAndCourseScore = 0;
  const isSameCampus =
    userCriteria.campus.toLowerCase().includes(candidate.campus.toLowerCase()) ||
    candidate.campus.toLowerCase().includes(userCriteria.campus.toLowerCase());

  if (isSameCampus) {
    campusAndCourseScore += 10;
  } else {
    campusAndCourseScore += 4;
  }

  const isSameCourse =
    userCriteria.course.toLowerCase().includes("cse") &&
    candidate.course.toLowerCase().includes("cse");
  if (isSameCourse) {
    campusAndCourseScore += 5;
  } else if (
    userCriteria.course.toLowerCase().split(" ")[0] ===
    candidate.course.toLowerCase().split(" ")[0]
  ) {
    campusAndCourseScore += 3;
  }

  // 5. Budget Compatibility (10 pts)
  let budgetScore = 0;
  const minOverlap = Math.max(userCriteria.budgetMin, pref.budgetMin);
  const maxOverlap = Math.min(userCriteria.budgetMax, pref.budgetMax);

  if (minOverlap <= maxOverlap) {
    budgetScore = 10; // Overlapping range
  } else {
    const gap = minOverlap - maxOverlap;
    if (gap <= 1500) {
      budgetScore = 6;
    } else {
      budgetScore = 0;
    }
  }

  // 6. Target Location (10 pts)
  let locationScore = 0;
  const sharedLocations = userCriteria.targetLocations.filter((loc) =>
    pref.targetLocations.some(
      (target) =>
        loc.toLowerCase().includes(target.toLowerCase()) ||
        target.toLowerCase().includes(loc.toLowerCase())
    )
  );

  if (sharedLocations.length > 0) {
    locationScore = 10;
  } else {
    locationScore = 3;
  }

  const totalScore = Math.min(
    98,
    Math.max(
      35,
      sleepScore +
        dietScore +
        cleanlinessScore +
        campusAndCourseScore +
        budgetScore +
        locationScore
    )
  );

  // Generate Highlight Text & Icon
  let highlightIcon: "zap" | "gamepad" | "leaf" | "sparkles" | "book" = "sparkles";
  let highlightText = `${totalScore}% Match`;

  if (totalScore >= 90) {
    highlightIcon = "zap";
    if (sleepScore === 25 && dietScore === 20) {
      highlightText = `${totalScore}% Match • Early Bird & Pure Veg`;
    } else if (cleanlinessScore === 20) {
      highlightText = `${totalScore}% Match • High Hygiene & Same Campus`;
    } else {
      highlightText = `${totalScore}% Match • Top Lifestyle Compatibility`;
    }
  } else if (totalScore >= 75) {
    highlightIcon = "sparkles";
    if (pref.sleepCycle === SleepCycle.NIGHT_OWL) {
      highlightIcon = "gamepad";
      highlightText = `${totalScore}% Match • Night Owl & Chill`;
    } else if (dietScore >= 18) {
      highlightIcon = "leaf";
      highlightText = `${totalScore}% Match • Compatible Diet & Routine`;
    } else {
      highlightText = `${totalScore}% Match • Compatible Habits`;
    }
  } else {
    highlightIcon = "book";
    highlightText = `${totalScore}% Match • Different Schedule`;
  }

  return {
    candidate,
    matchPercentage: totalScore,
    matchHighlight: {
      icon: highlightIcon,
      text: highlightText,
    },
    scoreBreakdown: {
      sleep: sleepScore,
      diet: dietScore,
      cleanliness: cleanlinessScore,
      campusAndCourse: campusAndCourseScore,
      budget: budgetScore,
      location: locationScore,
    },
  };
}
