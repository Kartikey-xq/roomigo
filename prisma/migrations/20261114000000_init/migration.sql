-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "CampusLocation" AS ENUM ('GEHU', 'GEU_MAIN', 'BOTH');

-- CreateEnum
CREATE TYPE "PreferredGenderRule" AS ENUM ('SAME_GENDER_ONLY', 'ANY_GENDER');

-- CreateEnum
CREATE TYPE "SleepCycle" AS ENUM ('EARLY_BIRD', 'NIGHT_OWL', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "DietHabit" AS ENUM ('PURE_VEGETARIAN', 'EGGETARIAN', 'NON_VEGETARIAN');

-- CreateEnum
CREATE TYPE "CleanlinessHabit" AS ENUM ('DAILY_HIGH', 'MODERATE_WEEKLY');

-- CreateEnum
CREATE TYPE "SmokingHabit" AS ENUM ('NON_SMOKER', 'OUTDOOR_ONLY', 'SMOKER');

-- CreateEnum
CREATE TYPE "StudyHabit" AS ENUM ('QUIET_ALONE', 'GROUP_STUDY', 'MUSIC_BACKGROUND', 'LATE_NIGHT_LIBRARY');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ResidenceType" AS ENUM ('CO_ED', 'BOYS_ONLY', 'GIRLS_ONLY');

-- CreateEnum
CREATE TYPE "ProximityLandmark" AS ENUM ('GEHU_CAMPUS', 'GEU_MAIN_CAMPUS', 'CLEMENT_TOWN_MARKET', 'SUBHASH_NAGAR_CHOWK', 'BELL_ROAD', 'ISBT_DEHRADUN');

-- CreateEnum
CREATE TYPE "ProximityTravelMode" AS ENUM ('WALKING', 'SCOOTER', 'BUS');

-- CreateEnum
CREATE TYPE "AmenityIcon" AS ENUM ('WIFI', 'MEALS', 'BATH', 'POWER_BACKUP', 'WATER_PURIFIER', 'LAUNDRY', 'SECURITY_CCTV', 'GYM', 'AC', 'STUDY_DESK');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('HARASSMENT_ABUSE', 'FAKE_STUDENT_ID', 'FINANCIAL_SCAM', 'INAPPROPRIATE_BEHAVIOR', 'SPAM_COMMERCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebSocketTicket" (
    "id" UUID NOT NULL,
    "ticket" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebSocketTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "campus" "CampusLocation" NOT NULL DEFAULT 'GEHU',
    "course" TEXT NOT NULL,
    "yearOfStudy" TEXT NOT NULL,
    "currentTerm" TEXT NOT NULL,
    "affiliation" TEXT NOT NULL,
    "studentIdPrefix" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "phoneNumber" TEXT,
    "whatsappNumber" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentVerification" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "idCardImageUrl" TEXT NOT NULL,
    "enrollmentNumber" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByAdminId" UUID,
    "rejectionReason" TEXT,

    CONSTRAINT "StudentVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoommatePreference" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "isLive" BOOLEAN NOT NULL DEFAULT true,
    "preferredGender" "PreferredGenderRule" NOT NULL DEFAULT 'SAME_GENDER_ONLY',
    "budgetMin" INTEGER NOT NULL DEFAULT 6000,
    "budgetMax" INTEGER NOT NULL DEFAULT 10000,
    "targetLocations" TEXT[],
    "sleepCycle" "SleepCycle" NOT NULL DEFAULT 'EARLY_BIRD',
    "diet" "DietHabit" NOT NULL DEFAULT 'PURE_VEGETARIAN',
    "cleanliness" "CleanlinessHabit" NOT NULL DEFAULT 'DAILY_HIGH',
    "smoking" "SmokingHabit" NOT NULL DEFAULT 'NON_SMOKER',
    "studyHabit" "StudyHabit" NOT NULL DEFAULT 'QUIET_ALONE',
    "hobbies" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoommatePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchScanRecord" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "searchParams" JSONB NOT NULL,
    "matchedCount" INTEGER NOT NULL,
    "topMatchScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchScanRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoommateRequest" (
    "id" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestMessage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "RoommateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" UUID NOT NULL,
    "directKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "isDelivered" BOOLEAN NOT NULL DEFAULT true,
    "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "deletedBySender" BOOLEAN NOT NULL DEFAULT false,
    "deletedByRecipient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockReport" (
    "id" UUID NOT NULL,
    "reporterId" UUID NOT NULL,
    "reportedUserId" UUID NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT NOT NULL,
    "saveProof" BOOLEAN NOT NULL DEFAULT true,
    "chatEvidenceSnapshot" JSONB,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "BlockReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "residenceType" "ResidenceType" NOT NULL DEFAULT 'CO_ED',
    "wingsInfo" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Dehradun',
    "state" TEXT NOT NULL DEFAULT 'Uttarakhand',
    "pincode" TEXT NOT NULL DEFAULT '248002',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "ratingScore" DECIMAL(2,1) NOT NULL DEFAULT 4.8,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "minPrice" INTEGER NOT NULL,
    "maxPrice" INTEGER,
    "pricingPeriod" TEXT NOT NULL DEFAULT '/mo',
    "inclusionsNote" TEXT NOT NULL,
    "totalBedsLeft" INTEGER NOT NULL DEFAULT 0,
    "availabilitySummary" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerWhatsappNumber" TEXT NOT NULL,
    "ownerRole" TEXT NOT NULL DEFAULT 'Property Manager',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BedConfiguration" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "period" TEXT NOT NULL DEFAULT '/month',
    "availableBeds" INTEGER NOT NULL DEFAULT 0,
    "statusLabel" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BedConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingProximity" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "landmark" "ProximityLandmark" NOT NULL,
    "customName" TEXT,
    "distance" TEXT NOT NULL,
    "timeEstimate" TEXT NOT NULL,
    "travelMode" "ProximityTravelMode" NOT NULL DEFAULT 'WALKING',

    CONSTRAINT "ListingProximity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingAmenity" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "icon" "AmenityIcon" NOT NULL DEFAULT 'WIFI',

    CONSTRAINT "ListingAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedListing" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_tokenHash_idx" ON "Session"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "WebSocketTicket_ticket_key" ON "WebSocketTicket"("ticket");

-- CreateIndex
CREATE INDEX "WebSocketTicket_ticket_idx" ON "WebSocketTicket"("ticket");

-- CreateIndex
CREATE INDEX "WebSocketTicket_userId_idx" ON "WebSocketTicket"("userId");

-- CreateIndex
CREATE INDEX "WebSocketTicket_sessionId_idx" ON "WebSocketTicket"("sessionId");

-- CreateIndex
CREATE INDEX "WebSocketTicket_expiresAt_idx" ON "WebSocketTicket"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE INDEX "StudentProfile_campus_course_idx" ON "StudentProfile"("campus", "course");

-- CreateIndex
CREATE INDEX "StudentProfile_verificationStatus_idx" ON "StudentProfile"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "StudentVerification_profileId_key" ON "StudentVerification"("profileId");

-- CreateIndex
CREATE INDEX "StudentVerification_enrollmentNumber_idx" ON "StudentVerification"("enrollmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RoommatePreference_profileId_key" ON "RoommatePreference"("profileId");

-- CreateIndex
CREATE INDEX "RoommatePreference_isLive_budgetMin_budgetMax_idx" ON "RoommatePreference"("isLive", "budgetMin", "budgetMax");

-- CreateIndex
CREATE INDEX "MatchScanRecord_userId_createdAt_idx" ON "MatchScanRecord"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RoommateRequest_receiverId_status_idx" ON "RoommateRequest"("receiverId", "status");

-- CreateIndex
CREATE INDEX "RoommateRequest_senderId_status_idx" ON "RoommateRequest"("senderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RoommateRequest_senderId_receiverId_key" ON "RoommateRequest"("senderId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_directKey_key" ON "Conversation"("directKey");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_directKey_idx" ON "Conversation"("directKey");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "BlockReport_reportedUserId_status_idx" ON "BlockReport"("reportedUserId", "status");

-- CreateIndex
CREATE INDEX "BlockReport_reporterId_idx" ON "BlockReport"("reporterId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");

-- CreateIndex
CREATE INDEX "Listing_city_isPublished_idx" ON "Listing"("city", "isPublished");

-- CreateIndex
CREATE INDEX "Listing_minPrice_maxPrice_idx" ON "Listing"("minPrice", "maxPrice");

-- CreateIndex
CREATE INDEX "Listing_totalBedsLeft_idx" ON "Listing"("totalBedsLeft");

-- CreateIndex
CREATE INDEX "ListingImage_listingId_orderIndex_idx" ON "ListingImage"("listingId", "orderIndex");

-- CreateIndex
CREATE INDEX "BedConfiguration_listingId_idx" ON "BedConfiguration"("listingId");

-- CreateIndex
CREATE INDEX "ListingProximity_listingId_idx" ON "ListingProximity"("listingId");

-- CreateIndex
CREATE INDEX "ListingAmenity_listingId_idx" ON "ListingAmenity"("listingId");

-- CreateIndex
CREATE INDEX "SavedListing_userId_idx" ON "SavedListing"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedListing_userId_listingId_key" ON "SavedListing"("userId", "listingId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebSocketTicket" ADD CONSTRAINT "WebSocketTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebSocketTicket" ADD CONSTRAINT "WebSocketTicket_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentVerification" ADD CONSTRAINT "StudentVerification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommatePreference" ADD CONSTRAINT "RoommatePreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScanRecord" ADD CONSTRAINT "MatchScanRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateRequest" ADD CONSTRAINT "RoommateRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateRequest" ADD CONSTRAINT "RoommateRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockReport" ADD CONSTRAINT "BlockReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockReport" ADD CONSTRAINT "BlockReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedConfiguration" ADD CONSTRAINT "BedConfiguration_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingProximity" ADD CONSTRAINT "ListingProximity_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAmenity" ADD CONSTRAINT "ListingAmenity_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedListing" ADD CONSTRAINT "SavedListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedListing" ADD CONSTRAINT "SavedListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

