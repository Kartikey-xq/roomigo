import {
  PrismaClient,
  UserRole,
  Gender,
  CampusLocation,
  PreferredGenderRule,
  SleepCycle,
  DietHabit,
  CleanlinessHabit,
  SmokingHabit,
  StudyHabit,
  VerificationStatus,
  ResidenceType,
  ProximityLandmark,
  ProximityTravelMode,
  AmenityIcon,
  RequestStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("🛑 Refusing to run destructive deleteMany seed in production environment!");
    console.error("In production, use targeted non-destructive migrations or listing seed scripts.");
    throw new Error("Destructive seed script is blocked in production.");
  }

  console.log("🌱 Cleaning existing data...");
  await prisma.savedListing.deleteMany();
  await prisma.bedConfiguration.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listingProximity.deleteMany();
  await prisma.listingAmenity.deleteMany();
  await prisma.listing.deleteMany();

  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.roommateRequest.deleteMany();
  await prisma.matchScanRecord.deleteMany();
  await prisma.blockReport.deleteMany();

  await prisma.roommatePreference.deleteMany();
  await prisma.studentVerification.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash("Password@123", 10);
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);

  console.log("👤 Creating Admin user...");
  await prisma.user.create({
    data: {
      email: "admin@roomify.in",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      isDemo: true,
      studentProfile: {
        create: {
          fullName: "Roomify Admin",
          gender: Gender.OTHER,
          campus: CampusLocation.BOTH,
          course: "Platform Administration",
          yearOfStudy: "Staff",
          currentTerm: "N/A",
          affiliation: "Graphic Era Directorate",
          verificationStatus: VerificationStatus.VERIFIED,
        },
      },
    },
  });

  console.log("👥 Creating Student personas for matching and chat...");

  // 1. Student A (Primary Test Account: Kartikey Joshi)
  const userA = await prisma.user.create({
    data: {
      email: "kartikey@gehu.ac.in",
      passwordHash: defaultPasswordHash,
      role: UserRole.STUDENT,
      isEmailVerified: true,
      isDemo: true,
      studentProfile: {
        create: {
          fullName: "Kartikey Joshi",
          gender: Gender.MALE,
          campus: CampusLocation.GEHU,
          course: "B.Tech Computer Science & Engg.",
          yearOfStudy: "2nd Year",
          currentTerm: "4th Sem (2nd Yr)",
          affiliation: "GEHU Dehradun",
          studentIdPrefix: "GEHU-CSE-2023",
          avatarUrl:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
          bio: "2nd year CSE student at GEHU. Looking for a neat flatmate to share a 2BHK or double sharing room near Bell Road / Subhash Nagar. Coding enthusiast, non-smoker, early sleeper.",
          phoneNumber: "+91 98765 43210",
          whatsappNumber: "919876543210",
          verificationStatus: VerificationStatus.VERIFIED,
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
              hobbies: ["Competitive Programming", "Badminton", "Reading"],
            },
          },
        },
      },
    },
    include: { studentProfile: true },
  });

  // 2. Student B (Secondary Test Account: Aarav Sharma - High Match with A)
  await prisma.user.create({
    data: {
      email: "aarav@gehu.ac.in",
      passwordHash: defaultPasswordHash,
      role: UserRole.STUDENT,
      isEmailVerified: true,
      isDemo: true,
      studentProfile: {
        create: {
          fullName: "Aarav Sharma",
          gender: Gender.MALE,
          campus: CampusLocation.GEHU,
          course: "B.Tech CSE",
          yearOfStudy: "2nd Year",
          currentTerm: "4th Sem (2nd Yr)",
          affiliation: "GEHU Dehradun",
          studentIdPrefix: "GEHU-CSE-2023",
          avatarUrl:
            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
          bio: "2nd year CSE student at GEHU. Looking for a neat flatmate to share a 2BHK or double sharing room near Subhash Nagar / Bell Road. Non-smoker, early sleeper.",
          phoneNumber: "+91 98765 11111",
          whatsappNumber: "919876511111",
          verificationStatus: VerificationStatus.VERIFIED,
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
              hobbies: ["Competitive Programming", "Badminton", "Reading"],
            },
          },
        },
      },
    },
    include: { studentProfile: true },
  });

  // 3. Student C (Rohan Verma - GEU Night Owl)
  const userC = await prisma.user.create({
    data: {
      email: "rohan@geu.ac.in",
      passwordHash: defaultPasswordHash,
      role: UserRole.STUDENT,
      isEmailVerified: true,
      isDemo: true,
      studentProfile: {
        create: {
          fullName: "Rohan Verma",
          gender: Gender.MALE,
          campus: CampusLocation.GEU_MAIN,
          course: "BCA",
          yearOfStudy: "1st Year",
          currentTerm: "2nd Sem (1st Yr)",
          affiliation: "GEU Main Campus",
          studentIdPrefix: "GEU-BCA-2024",
          avatarUrl:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
          bio: "1st year BCA student at GEU Main Campus. Chill flatmate who loves gaming and late-night study sessions. Looking for someone okay with night gaming & food runs.",
          verificationStatus: VerificationStatus.VERIFIED,
          roommatePreference: {
            create: {
              isLive: true,
              preferredGender: PreferredGenderRule.ANY_GENDER,
              budgetMin: 6000,
              budgetMax: 8500,
              targetLocations: ["Subhash Nagar PGs", "Clement Town"],
              sleepCycle: SleepCycle.NIGHT_OWL,
              diet: DietHabit.NON_VEGETARIAN,
              cleanliness: CleanlinessHabit.MODERATE_WEEKLY,
              smoking: SmokingHabit.NON_SMOKER,
              studyHabit: StudyHabit.MUSIC_BACKGROUND,
              hobbies: ["Valorant", "Guitar", "Anime"],
            },
          },
        },
      },
    },
    include: { studentProfile: true },
  });

  // 4. Student D (Priya Nautiyal - Female, GEHU ECE)
  await prisma.user.create({
    data: {
      email: "priya@gehu.ac.in",
      passwordHash: defaultPasswordHash,
      role: UserRole.STUDENT,
      isEmailVerified: true,
      isDemo: true,
      studentProfile: {
        create: {
          fullName: "Priya Nautiyal",
          gender: Gender.FEMALE,
          campus: CampusLocation.GEHU,
          course: "B.Tech ECE",
          yearOfStudy: "3rd Year",
          currentTerm: "6th Sem (3rd Yr)",
          affiliation: "GEHU Dehradun",
          studentIdPrefix: "GEHU-ECE-2022",
          avatarUrl:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
          bio: "ECE 3rd yearite. Seeking a respectful and peaceful roommate for an apartment near Turner Road. Very focused on academics during exams, love cooking chai on weekends.",
          verificationStatus: VerificationStatus.VERIFIED,
          roommatePreference: {
            create: {
              isLive: true,
              preferredGender: PreferredGenderRule.SAME_GENDER_ONLY,
              budgetMin: 8000,
              budgetMax: 11000,
              targetLocations: ["Turner Road Apartments"],
              sleepCycle: SleepCycle.FLEXIBLE,
              diet: DietHabit.PURE_VEGETARIAN,
              cleanliness: CleanlinessHabit.DAILY_HIGH,
              smoking: SmokingHabit.NON_SMOKER,
              studyHabit: StudyHabit.QUIET_ALONE,
              hobbies: ["Yoga", "Cooking", "Podcasts"],
            },
          },
        },
      },
    },
    include: { studentProfile: true },
  });

  // 5. Student E (Aditya Rawat - GEU IT Fitness)
  const userE = await prisma.user.create({
    data: {
      email: "aditya@geu.ac.in",
      passwordHash: defaultPasswordHash,
      role: UserRole.STUDENT,
      isEmailVerified: true,
      isDemo: true,
      studentProfile: {
        create: {
          fullName: "Aditya Rawat",
          gender: Gender.MALE,
          campus: CampusLocation.GEU_MAIN,
          course: "B.Tech IT",
          yearOfStudy: "2nd Year",
          currentTerm: "4th Sem (2nd Yr)",
          affiliation: "GEU Main Campus",
          studentIdPrefix: "GEU-IT-2023",
          avatarUrl:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
          bio: "Gym enthusiast and IT sophomore. Looking for a room partner who respects workout schedules and maintains cleanliness. Early riser, no partying inside flat.",
          verificationStatus: VerificationStatus.VERIFIED,
          roommatePreference: {
            create: {
              isLive: true,
              preferredGender: PreferredGenderRule.SAME_GENDER_ONLY,
              budgetMin: 7000,
              budgetMax: 9000,
              targetLocations: ["Clement Town Flats", "Subhash Nagar PGs"],
              sleepCycle: SleepCycle.EARLY_BIRD,
              diet: DietHabit.EGGETARIAN,
              cleanliness: CleanlinessHabit.DAILY_HIGH,
              smoking: SmokingHabit.NON_SMOKER,
              studyHabit: StudyHabit.QUIET_ALONE,
              hobbies: ["Fitness", "Calisthenics", "Football"],
            },
          },
        },
      },
    },
    include: { studentProfile: true },
  });

  // 6. Student F (Ayush Bisht - BBA High Hygiene)
  await prisma.user.create({
    data: {
      email: "ayush@gehu.ac.in",
      passwordHash: defaultPasswordHash,
      role: UserRole.STUDENT,
      isEmailVerified: true,
      isDemo: true,
      studentProfile: {
        create: {
          fullName: "Ayush Bisht",
          gender: Gender.MALE,
          campus: CampusLocation.GEHU,
          course: "BBA",
          yearOfStudy: "1st Year",
          currentTerm: "2nd Sem (1st Yr)",
          affiliation: "GEHU Dehradun",
          studentIdPrefix: "GEHU-BBA-2024",
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
          bio: "BBA student looking for flatmate who values neatness and clean surroundings.",
          verificationStatus: VerificationStatus.VERIFIED,
          roommatePreference: {
            create: {
              isLive: true,
              preferredGender: PreferredGenderRule.SAME_GENDER_ONLY,
              budgetMin: 7000,
              budgetMax: 9500,
              targetLocations: ["Turner Road Flats", "Bell Road PGs"],
              sleepCycle: SleepCycle.EARLY_BIRD,
              diet: DietHabit.PURE_VEGETARIAN,
              cleanliness: CleanlinessHabit.DAILY_HIGH,
              smoking: SmokingHabit.NON_SMOKER,
              studyHabit: StudyHabit.QUIET_ALONE,
              hobbies: ["Debating", "Swimming", "Stocks"],
            },
          },
        },
      },
    },
    include: { studentProfile: true },
  });

  // 7. Student G (Karan Singhal - GEU CSE LeetCode)
  await prisma.user.create({
    data: {
      email: "karan@geu.ac.in",
      passwordHash: defaultPasswordHash,
      role: UserRole.STUDENT,
      isEmailVerified: true,
      isDemo: true,
      studentProfile: {
        create: {
          fullName: "Karan Singhal",
          gender: Gender.MALE,
          campus: CampusLocation.GEU_MAIN,
          course: "B.Tech CSE",
          yearOfStudy: "2nd Year",
          currentTerm: "4th Sem (2nd Yr)",
          affiliation: "GEU Main Campus",
          studentIdPrefix: "GEU-CSE-2023",
          avatarUrl:
            "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
          bio: "CSE student preparing for summer internships. Looking for someone with similar tech drive.",
          verificationStatus: VerificationStatus.VERIFIED,
          roommatePreference: {
            create: {
              isLive: true,
              preferredGender: PreferredGenderRule.SAME_GENDER_ONLY,
              budgetMin: 7500,
              budgetMax: 10000,
              targetLocations: ["Lane 4 Clement Town", "Bell Road PGs"],
              sleepCycle: SleepCycle.FLEXIBLE,
              diet: DietHabit.PURE_VEGETARIAN,
              cleanliness: CleanlinessHabit.DAILY_HIGH,
              smoking: SmokingHabit.NON_SMOKER,
              studyHabit: StudyHabit.QUIET_ALONE,
              hobbies: ["DSA", "Cricket", "Badminton"],
            },
          },
        },
      },
    },
    include: { studentProfile: true },
  });

  // 8. Student H (Sneha Dobhal - Female, GEHU MBA)
  await prisma.user.create({
    data: {
      email: "sneha@gehu.ac.in",
      passwordHash: defaultPasswordHash,
      role: UserRole.STUDENT,
      isEmailVerified: true,
      isDemo: true,
      studentProfile: {
        create: {
          fullName: "Sneha Dobhal",
          gender: Gender.FEMALE,
          campus: CampusLocation.GEHU,
          course: "MBA",
          yearOfStudy: "1st Year",
          currentTerm: "2nd Sem (1st Yr)",
          affiliation: "GEHU Dehradun",
          studentIdPrefix: "GEHU-MBA-2024",
          avatarUrl:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
          bio: "MBA 1st year at GEHU. Looking for a neat and peaceful female roommate for sharing flat near Bell Road.",
          verificationStatus: VerificationStatus.VERIFIED,
          roommatePreference: {
            create: {
              isLive: true,
              preferredGender: PreferredGenderRule.SAME_GENDER_ONLY,
              budgetMin: 8000,
              budgetMax: 12000,
              targetLocations: ["Bell Road PGs", "Turner Road Flats"],
              sleepCycle: SleepCycle.EARLY_BIRD,
              diet: DietHabit.PURE_VEGETARIAN,
              cleanliness: CleanlinessHabit.DAILY_HIGH,
              smoking: SmokingHabit.NON_SMOKER,
              studyHabit: StudyHabit.QUIET_ALONE,
              hobbies: ["Reading", "Coffee", "Travelling"],
            },
          },
        },
      },
    },
    include: { studentProfile: true },
  });

  console.log("💬 Creating initial conversations and messages between test users...");
  // Conversation between Kartikey (userA) and Rohan (userC)
  await prisma.conversation.create({
    data: {
      lastMessageAt: new Date(Date.now() - 3600000),
      participants: {
        create: [
          { userId: userA.id, lastReadAt: new Date() },
          { userId: userC.id, lastReadAt: new Date() },
        ],
      },
      messages: {
        create: [
          {
            senderId: userC.id,
            text: "Landlord agreed to 8k per head with Wi-Fi included! When can you meet?",
            createdAt: new Date(Date.now() - 7200000),
            isDelivered: true,
            isRead: true,
          },
          {
            senderId: userA.id,
            text: "I can visit post my classes at GEHU around 4:30 PM.",
            createdAt: new Date(Date.now() - 3600000),
            isDelivered: true,
            isRead: true,
          },
        ],
      },
    },
  });

  // Match request from Aditya (userE) to Kartikey (userA)
  await prisma.roommateRequest.create({
    data: {
      senderId: userE.id,
      receiverId: userA.id,
      status: RequestStatus.PENDING,
      requestMessage:
        "Hey Kartikey! Noticed you are looking for twin sharing near Bell Road. I am also an early riser and clean daily.",
      createdAt: new Date(Date.now() - 86400000),
    },
  });

  console.log("🏢 Seeding Accommodation Listings (with multi-page pagination data)...");

  const listingsData = [
    {
      slug: "stanza-cambridge-house",
      title: "Stanza Living – Cambridge House",
      isVerified: true,
      residenceType: ResidenceType.CO_ED,
      wingsInfo: "Boys & Girls Wings",
      ratingScore: 4.8,
      ratingCount: 124,
      addressLine: "Lane 4, Subhash Nagar, Clement Town",
      city: "Dehradun",
      state: "Uttarakhand",
      pincode: "248002",
      totalBedsLeft: 3,
      availabilitySummary: "Both Single & Twin Available",
      minPrice: 8200,
      maxPrice: 12500,
      pricingPeriod: "/mo",
      inclusionsNote: "Electricity & 3 Daily Meals Included",
      ownerName: "Vipin Negi",
      ownerWhatsappNumber: "919876543210",
      ownerRole: "Property Manager",
      images: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      ],
      bedConfigs: [
        { name: "Twin Sharing", price: 8200, availableBeds: 2, statusLabel: "2 beds left", isAvailable: true },
        { name: "Single Room", price: 12500, availableBeds: 1, statusLabel: "Only 1 room left", isAvailable: true },
      ],
      proximities: [
        { landmark: ProximityLandmark.GEHU_CAMPUS, distance: "450m", timeEstimate: "5 mins walking", travelMode: ProximityTravelMode.WALKING },
        { landmark: ProximityLandmark.GEU_MAIN_CAMPUS, distance: "1.2 km", timeEstimate: "3 mins scooty / 12m walk", travelMode: ProximityTravelMode.SCOOTER },
      ],
      amenities: [
        { title: "300 Mbps", subtitle: "Wi-Fi", icon: AmenityIcon.WIFI },
        { title: "3x Meals", subtitle: "+ Tea Snack", icon: AmenityIcon.MEALS },
        { title: "Attached", subtitle: "Geyser Bath", icon: AmenityIcon.BATH },
        { title: "100% Power", subtitle: "Generator", icon: AmenityIcon.POWER_BACKUP },
        { title: "RO UV+", subtitle: "Clean Water", icon: AmenityIcon.WATER_PURIFIER },
        { title: "Free Wash", subtitle: "Laundry", icon: AmenityIcon.LAUNDRY },
      ],
    },
    {
      slug: "hive-hostels-clement-town",
      title: "The Hive Hostels – Clement Luxury",
      isVerified: true,
      residenceType: ResidenceType.BOYS_ONLY,
      wingsInfo: "Boys Exclusive Wing",
      ratingScore: 4.7,
      ratingCount: 89,
      addressLine: "Opposite Graphic Era Gate 2, Bell Road",
      city: "Dehradun",
      state: "Uttarakhand",
      pincode: "248002",
      totalBedsLeft: 4,
      availabilitySummary: "Triple & Twin Available",
      minPrice: 7500,
      maxPrice: 10500,
      pricingPeriod: "/mo",
      inclusionsNote: "Breakfast + Dinner & High Speed Wi-Fi",
      ownerName: "Sunil Rawat",
      ownerWhatsappNumber: "919876543211",
      ownerRole: "Warden & Manager",
      images: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
      ],
      bedConfigs: [
        { name: "Triple Sharing", price: 7500, availableBeds: 3, statusLabel: "3 beds left", isAvailable: true },
        { name: "Twin Sharing", price: 9200, availableBeds: 1, statusLabel: "1 bed left", isAvailable: true },
      ],
      proximities: [
        { landmark: ProximityLandmark.GEHU_CAMPUS, distance: "200m", timeEstimate: "2 mins walk", travelMode: ProximityTravelMode.WALKING },
        { landmark: ProximityLandmark.GEU_MAIN_CAMPUS, distance: "800m", timeEstimate: "8 mins walk", travelMode: ProximityTravelMode.WALKING },
      ],
      amenities: [
        { title: "200 Mbps", subtitle: "Wi-Fi", icon: AmenityIcon.WIFI },
        { title: "2x Meals", subtitle: "Daily Mess", icon: AmenityIcon.MEALS },
        { title: "Attached", subtitle: "Bathroom", icon: AmenityIcon.BATH },
        { title: "24/7 CCTV", subtitle: "Biometric", icon: AmenityIcon.SECURITY_CCTV },
      ],
    },
    {
      slug: "heritage-girls-hostel",
      title: "Heritage Girls Residency",
      isVerified: true,
      residenceType: ResidenceType.GIRLS_ONLY,
      wingsInfo: "Strict Female Only Campus",
      ratingScore: 4.9,
      ratingCount: 156,
      addressLine: "Turner Road, Near Post Office, Clement Town",
      city: "Dehradun",
      state: "Uttarakhand",
      pincode: "248002",
      totalBedsLeft: 0, // SOLD OUT
      availabilitySummary: "Sold Out for Current Sem",
      minPrice: 9000,
      maxPrice: 13000,
      pricingPeriod: "/mo",
      inclusionsNote: "Pure Veg 4-Course Mess & AC Invertor",
      ownerName: "Mrs. Pushpa Joshi",
      ownerWhatsappNumber: "919876543212",
      ownerRole: "Owner",
      images: [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
      ],
      bedConfigs: [
        { name: "Double Sharing", price: 9000, availableBeds: 0, statusLabel: "Sold Out", isAvailable: false },
        { name: "Single Executive", price: 13000, availableBeds: 0, statusLabel: "Sold Out", isAvailable: false },
      ],
      proximities: [
        { landmark: ProximityLandmark.GEHU_CAMPUS, distance: "600m", timeEstimate: "7 mins walk", travelMode: ProximityTravelMode.WALKING },
        { landmark: ProximityLandmark.GEU_MAIN_CAMPUS, distance: "1.0 km", timeEstimate: "11 mins walk", travelMode: ProximityTravelMode.WALKING },
      ],
      amenities: [
        { title: "Pure Veg", subtitle: "Kitchen", icon: AmenityIcon.MEALS },
        { title: "3-Tier", subtitle: "Security", icon: AmenityIcon.SECURITY_CCTV },
        { title: "Wi-Fi", subtitle: "Fiber", icon: AmenityIcon.WIFI },
      ],
    },
    {
      slug: "doon-scholars-residence",
      title: "Doon Scholars Co-Living Hub",
      isVerified: true,
      residenceType: ResidenceType.CO_ED,
      wingsInfo: "Dedicated Blocks",
      ratingScore: 4.6,
      ratingCount: 74,
      addressLine: "Bell Road, Behind GEHU Sports Complex",
      city: "Dehradun",
      state: "Uttarakhand",
      pincode: "248002",
      totalBedsLeft: 5,
      availabilitySummary: "Single & Twin Sharing Open",
      minPrice: 7800,
      maxPrice: 11000,
      pricingPeriod: "/mo",
      inclusionsNote: "3 Meals + High Speed WiFi + Power Backup",
      ownerName: "Manoj Bhatt",
      ownerWhatsappNumber: "919876543213",
      ownerRole: "Property Owner",
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
      ],
      bedConfigs: [
        { name: "Twin Sharing", price: 7800, availableBeds: 3, statusLabel: "3 beds left", isAvailable: true },
        { name: "Single AC", price: 11000, availableBeds: 2, statusLabel: "2 rooms left", isAvailable: true },
      ],
      proximities: [
        { landmark: ProximityLandmark.GEHU_CAMPUS, distance: "150m", timeEstimate: "2 mins walk", travelMode: ProximityTravelMode.WALKING },
      ],
      amenities: [
        { title: "300 Mbps", subtitle: "Wi-Fi", icon: AmenityIcon.WIFI },
        { title: "3x Meals", subtitle: "Mess", icon: AmenityIcon.MEALS },
      ],
    },
    {
      slug: "green-valley-residency-lane4",
      title: "Green Valley Residency",
      isVerified: true,
      residenceType: ResidenceType.BOYS_ONLY,
      wingsInfo: "Boys Residence",
      ratingScore: 4.5,
      ratingCount: 52,
      addressLine: "Lane 6, Subhash Nagar, Dehradun",
      city: "Dehradun",
      state: "Uttarakhand",
      pincode: "248002",
      totalBedsLeft: 2,
      availabilitySummary: "Twin Sharing Available",
      minPrice: 6500,
      maxPrice: 8500,
      pricingPeriod: "/mo",
      inclusionsNote: "North Indian Mess & RO Water",
      ownerName: "Harish Semwal",
      ownerWhatsappNumber: "919876543214",
      ownerRole: "Manager",
      images: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
      ],
      bedConfigs: [
        { name: "Double Sharing", price: 6500, availableBeds: 2, statusLabel: "2 beds left", isAvailable: true },
      ],
      proximities: [
        { landmark: ProximityLandmark.GEU_MAIN_CAMPUS, distance: "700m", timeEstimate: "8 mins walk", travelMode: ProximityTravelMode.WALKING },
      ],
      amenities: [
        { title: "Mess", subtitle: "Home Cooked", icon: AmenityIcon.MEALS },
        { title: "Wi-Fi", subtitle: "Unlimited", icon: AmenityIcon.WIFI },
      ],
    },
    {
      slug: "shivalik-student-apartments",
      title: "Shivalik Student Studio Apartments",
      isVerified: true,
      residenceType: ResidenceType.CO_ED,
      wingsInfo: "Independent Studio Flats",
      ratingScore: 4.9,
      ratingCount: 110,
      addressLine: "Near Clement Town Lake, Dehradun",
      city: "Dehradun",
      state: "Uttarakhand",
      pincode: "248002",
      totalBedsLeft: 1,
      availabilitySummary: "Last 1BHK Studio Remaining",
      minPrice: 11500,
      maxPrice: 15000,
      pricingPeriod: "/mo",
      inclusionsNote: "Kitchenette + Gym + AC Studio",
      ownerName: "Deepak Chauhan",
      ownerWhatsappNumber: "919876543215",
      ownerRole: "Owner",
      images: [
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      ],
      bedConfigs: [
        { name: "1BHK Studio", price: 11500, availableBeds: 1, statusLabel: "Only 1 unit left", isAvailable: true },
      ],
      proximities: [
        { landmark: ProximityLandmark.GEHU_CAMPUS, distance: "1.1 km", timeEstimate: "12 mins walk", travelMode: ProximityTravelMode.WALKING },
        { landmark: ProximityLandmark.GEU_MAIN_CAMPUS, distance: "1.3 km", timeEstimate: "15 mins walk", travelMode: ProximityTravelMode.WALKING },
      ],
      amenities: [
        { title: "In-Room", subtitle: "Kitchen", icon: AmenityIcon.MEALS },
        { title: "Fitness", subtitle: "Gym Access", icon: AmenityIcon.GYM },
        { title: "AC", subtitle: "Split AC", icon: AmenityIcon.AC },
      ],
    },
    {
      slug: "campbridge-premium-girls",
      title: "Cambridge Premium Girls Annex",
      isVerified: true,
      residenceType: ResidenceType.GIRLS_ONLY,
      wingsInfo: "All-Girls Secured Building",
      ratingScore: 4.8,
      ratingCount: 68,
      addressLine: "Lane 3, Subhash Nagar, Clement Town",
      city: "Dehradun",
      state: "Uttarakhand",
      pincode: "248002",
      totalBedsLeft: 3,
      availabilitySummary: "Twin Sharing Available",
      minPrice: 8800,
      maxPrice: 11500,
      pricingPeriod: "/mo",
      inclusionsNote: "All 3 Meals + Tea + Laundry + Power Backup",
      ownerName: "Kavita Bisht",
      ownerWhatsappNumber: "919876543216",
      ownerRole: "Resident Warden",
      images: [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      ],
      bedConfigs: [
        { name: "Twin Sharing", price: 8800, availableBeds: 2, statusLabel: "2 beds left", isAvailable: true },
        { name: "Single Room", price: 11500, availableBeds: 1, statusLabel: "1 room left", isAvailable: true },
      ],
      proximities: [
        { landmark: ProximityLandmark.GEHU_CAMPUS, distance: "500m", timeEstimate: "6 mins walk", travelMode: ProximityTravelMode.WALKING },
      ],
      amenities: [
        { title: "Security", subtitle: "Biometric & Guard", icon: AmenityIcon.SECURITY_CCTV },
        { title: "Meals", subtitle: "Home Style", icon: AmenityIcon.MEALS },
      ],
    },
    {
      slug: "apex-hostel-bell-road",
      title: "Apex Boys Hostel – Bell Road",
      isVerified: true,
      residenceType: ResidenceType.BOYS_ONLY,
      wingsInfo: "Boys Hostel",
      ratingScore: 4.4,
      ratingCount: 45,
      addressLine: "Main Bell Road, Near Graphic Era Gate 3",
      city: "Dehradun",
      state: "Uttarakhand",
      pincode: "248002",
      totalBedsLeft: 6,
      availabilitySummary: "Double & Triple Sharing",
      minPrice: 6800,
      maxPrice: 8500,
      pricingPeriod: "/mo",
      inclusionsNote: "Includes High-Speed Wi-Fi & 3 Meals",
      ownerName: "Anil Bhandari",
      ownerWhatsappNumber: "919876543217",
      ownerRole: "Manager",
      images: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
      ],
      bedConfigs: [
        { name: "Triple Sharing", price: 6800, availableBeds: 4, statusLabel: "4 beds left", isAvailable: true },
        { name: "Twin Sharing", price: 8500, availableBeds: 2, statusLabel: "2 beds left", isAvailable: true },
      ],
      proximities: [
        { landmark: ProximityLandmark.GEHU_CAMPUS, distance: "100m", timeEstimate: "1 min walk", travelMode: ProximityTravelMode.WALKING },
      ],
      amenities: [
        { title: "Wi-Fi", subtitle: "Fast Internet", icon: AmenityIcon.WIFI },
        { title: "Mess", subtitle: "Vegetarian", icon: AmenityIcon.MEALS },
      ],
    },
  ];

  for (const item of listingsData) {
    await prisma.listing.create({
      data: {
        slug: item.slug,
        title: item.title,
        isVerified: item.isVerified,
        residenceType: item.residenceType,
        wingsInfo: item.wingsInfo,
        ratingScore: item.ratingScore,
        ratingCount: item.ratingCount,
        addressLine: item.addressLine,
        city: item.city,
        state: item.state,
        pincode: item.pincode,
        totalBedsLeft: item.totalBedsLeft,
        availabilitySummary: item.availabilitySummary,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        pricingPeriod: item.pricingPeriod,
        inclusionsNote: item.inclusionsNote,
        ownerName: item.ownerName,
        ownerWhatsappNumber: item.ownerWhatsappNumber,
        ownerRole: item.ownerRole,
        images: {
          create: item.images.map((img, idx) => ({
            imageUrl: img,
            storageKey: `listings/${item.slug}/img_${idx}.jpg`,
            orderIndex: idx,
          })),
        },
        bedConfigurations: {
          create: item.bedConfigs.map((b) => ({
            name: b.name,
            price: b.price,
            availableBeds: b.availableBeds,
            statusLabel: b.statusLabel,
            isAvailable: b.isAvailable,
          })),
        },
        proximities: {
          create: item.proximities.map((p) => ({
            landmark: p.landmark,
            distance: p.distance,
            timeEstimate: p.timeEstimate,
            travelMode: p.travelMode,
          })),
        },
        amenities: {
          create: item.amenities.map((a) => ({
            title: a.title,
            subtitle: a.subtitle,
            icon: a.icon,
          })),
        },
      },
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
