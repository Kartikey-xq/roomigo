import prisma from "../lib/db/prisma";
import { evaluateCompatibility, MatchEvaluationCriteria, CandidateWithPreference } from "../lib/matching/engine";
import { SleepCycle, DietHabit, Gender, RequestStatus } from "@prisma/client";

async function runTwoAccountVerification() {
  console.log("=================================================");
  console.log("🧪 RUNNING ROOMIFY 2-ACCOUNT E2E VERIFICATION TEST");
  console.log("=================================================");

  // 1. Fetch Student A (Kartikey Joshi) and Student B (Aarav Sharma)
  const studentA = await prisma.studentProfile.findFirst({
    where: { user: { email: "kartikey@gehu.ac.in" } },
    include: { user: true, roommatePreference: true },
  });

  const studentB = await prisma.studentProfile.findFirst({
    where: { user: { email: "aarav@gehu.ac.in" } },
    include: { user: true, roommatePreference: true },
  });

  if (!studentA || !studentB || !studentA.roommatePreference || !studentB.roommatePreference) {
    throw new Error("Seed students A or B missing in PostgreSQL!");
  }

  console.log(`✅ Loaded Student A: ${studentA.fullName} (${studentA.user.email})`);
  console.log(`✅ Loaded Student B: ${studentB.fullName} (${studentB.user.email})`);

  // 2. Test Step 1: Initial High Compatibility
  const criteriaA: MatchEvaluationCriteria = {
    gender: studentA.gender,
    campus: studentA.campus,
    course: studentA.course,
    preferredGender: studentA.roommatePreference.preferredGender,
    sleepCycle: studentA.roommatePreference.sleepCycle,
    diet: studentA.roommatePreference.diet,
    cleanliness: studentA.roommatePreference.cleanliness,
    budgetMin: studentA.roommatePreference.budgetMin,
    budgetMax: studentA.roommatePreference.budgetMax,
    targetLocations: studentA.roommatePreference.targetLocations,
  };

  const initialMatch = evaluateCompatibility(
    criteriaA,
    studentB as unknown as CandidateWithPreference
  );

  console.log("\n--- TEST CASE 1: High Compatibility Scan ---");
  console.log(`Initial Match Score: ${initialMatch?.matchPercentage}%`);
  console.log(`Highlight Badge: [${initialMatch?.matchHighlight.icon}] "${initialMatch?.matchHighlight.text}"`);
  console.log(`Score Breakdown:`, initialMatch?.scoreBreakdown);

  if (!initialMatch || initialMatch.matchPercentage < 90) {
    throw new Error(`Expected >= 90% match, got ${initialMatch?.matchPercentage}%`);
  }
  console.log("✅ High Compatibility Passed (Score >= 90%)");

  // 3. Test Step 2: Incompatibility Simulation (Modify Student B's preferences)
  console.log("\n--- TEST CASE 2: Simulating Lifestyle Incompatibility ---");
  const incompatibleB: CandidateWithPreference = {
    ...(studentB as unknown as CandidateWithPreference),
    roommatePreference: {
      ...studentB.roommatePreference,
      sleepCycle: SleepCycle.NIGHT_OWL, // Early Bird vs Night Owl (0 pts)
      diet: DietHabit.NON_VEGETARIAN,   // Pure Veg vs Non Veg (5 pts)
    },
  };

  const lowerMatch = evaluateCompatibility(criteriaA, incompatibleB);
  console.log(`Updated Match Score after change: ${lowerMatch?.matchPercentage}%`);
  console.log(`Updated Highlight: [${lowerMatch?.matchHighlight.icon}] "${lowerMatch?.matchHighlight.text}"`);
  console.log(`Updated Score Breakdown:`, lowerMatch?.scoreBreakdown);

  if (!lowerMatch || lowerMatch.matchPercentage > 75) {
    throw new Error(`Expected score to drop below 75%, got ${lowerMatch?.matchPercentage}%`);
  }
  console.log("✅ Incompatibility Drop Verified (Score predictably dropped)");

  // 4. Test Step 3: Hard Binary Constraint Failure (Gender Rule Conflict)
  console.log("\n--- TEST CASE 3: Hard Binary Constraint (Gender Rule) ---");
  const genderConflictB: CandidateWithPreference = {
    ...(studentB as unknown as CandidateWithPreference),
    gender: Gender.FEMALE, // Student A has SAME_GENDER_ONLY and is Male
  };

  const excludedMatch = evaluateCompatibility(criteriaA, genderConflictB);
  console.log("Match Result with Gender Conflict:", excludedMatch);
  if (excludedMatch !== null) {
    throw new Error("Expected hard binary exclusion (null), but candidate was matched!");
  }
  console.log("✅ Hard Binary Constraint Passed (Candidate excluded completely)");

  // 5. Test Step 4: Connection Request Lifecycle (A sends to B, B accepts)
  console.log("\n--- TEST CASE 4: Connection Request & Conversation Creation ---");
  // Clean prior requests between A and B
  await prisma.roommateRequest.deleteMany({
    where: {
      OR: [
        { senderId: studentA.userId, receiverId: studentB.userId },
        { senderId: studentB.userId, receiverId: studentA.userId },
      ],
    },
  });

  const request = await prisma.roommateRequest.create({
    data: {
      senderId: studentA.userId,
      receiverId: studentB.userId,
      requestMessage: "Hey Aarav! Let's check out flats together on Bell Road.",
      status: RequestStatus.PENDING,
    },
  });
  console.log(`Created Request ${request.id}: Status = ${request.status}`);

  // Student B accepts request
  const acceptResult = await prisma.$transaction(async (tx) => {
    const updated = await tx.roommateRequest.update({
      where: { id: request.id },
      data: { status: RequestStatus.ACCEPTED, respondedAt: new Date() },
    });

    const directKey = [studentA.userId, studentB.userId].sort().join(":");
    let conversation = await tx.conversation.findUnique({
      where: { directKey },
      include: { participants: true, messages: true },
    });

    if (!conversation) {
      conversation = await tx.conversation.create({
        data: {
          directKey,
          participants: {
            create: [
              { userId: studentA.userId },
              { userId: studentB.userId },
            ],
          },
          messages: {
            create: [
              {
                senderId: studentB.userId,
                text: "Hey Kartikey! Accepted your invite. When are you free to visit Cambridge House?",
                isDelivered: true,
              },
            ],
          },
        },
        include: { participants: true, messages: true },
      });
    }

    return { request: updated, conversation };
  });

  console.log(`✅ Request Accepted: Status = ${acceptResult.request.status}`);
  console.log(`✅ Conversation Created: ID = ${acceptResult.conversation.id}`);
  console.log(`✅ Initial Message: "${acceptResult.conversation.messages[0].text}"`);

  // Verify conversation is queryable by both participants
  const convForA = await prisma.conversation.findFirst({
    where: {
      id: acceptResult.conversation.id,
      participants: { some: { userId: studentA.userId } },
    },
  });

  const convForB = await prisma.conversation.findFirst({
    where: {
      id: acceptResult.conversation.id,
      participants: { some: { userId: studentB.userId } },
    },
  });

  if (!convForA || !convForB) {
    throw new Error("Conversation is not accessible to both participants!");
  }
  console.log("✅ Mutual Conversation Authorization Verified");

  console.log("\n=================================================");
  console.log("🎉 ALL 4 VERTICAL SLICE INTEGRATION TESTS PASSED!");
  console.log("=================================================\n");
}

runTwoAccountVerification()
  .catch((e) => {
    console.error("❌ Test Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
