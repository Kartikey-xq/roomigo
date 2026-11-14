import net from "net";
import dns from "dns";
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
} from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import dotenv from "dotenv";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function seedProduction() {
  const envFile = fs.existsSync(".env.neon")
    ? ".env.neon"
    : fs.existsSync(".env.production")
    ? ".env.production"
    : ".env";

  const envConfig = dotenv.parse(fs.readFileSync(envFile));
  const rawUrl = envConfig.DIRECT_URL || envConfig.DATABASE_URL_UNPOOLED || envConfig.DATABASE_URL;

  if (!rawUrl) {
    console.error("❌ No Neon connection string found.");
    process.exit(1);
  }

  const parsed = new URL(rawUrl);
  const targetHost = parsed.hostname;
  const endpointId = targetHost.split(".")[0];

  console.log(`Connecting to Neon production host: ${targetHost}...`);

  const addrs = await new Promise<string[]>((resolve, reject) => {
    dns.resolve4(targetHost, (err, addresses) => {
      if (err) return reject(err);
      resolve(addresses);
    });
  });

  const proxyPort = 5449;
  const proxy = net.createServer((clientSocket) => {
    const upstream = net.connect(5432, addrs[0], () => {
      clientSocket.pipe(upstream);
      upstream.pipe(clientSocket);
    });
    upstream.on("error", (e) => clientSocket.destroy(e));
    clientSocket.on("error", (e) => upstream.destroy(e));
  });

  await new Promise<void>((resolve) => proxy.listen(proxyPort, "127.0.0.1", () => resolve()));

  const proxyUrl = `postgresql://${parsed.username}:${parsed.password}@127.0.0.1:${proxyPort}${parsed.pathname}?sslmode=require&options=endpoint%3D${endpointId}`;

  const prisma = new PrismaClient({
    datasources: { db: { url: proxyUrl } },
  });

  try {
    console.log("🌱 Starting safe, non-destructive production seed on Neon...");

    const defaultPasswordHash = await bcrypt.hash("Pass@123", 10);
    const adminPasswordHash = await bcrypt.hash("Admin@Roomify2026", 10);

    // 1. Admin Account
    await prisma.user.upsert({
      where: { email: "admin@roomify.in" },
      update: {},
      create: {
        email: "admin@roomify.in",
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
        isEmailVerified: true,
        isDemo: false,
        studentProfile: {
          create: {
            fullName: "Roomify Admin",
            gender: Gender.OTHER,
            campus: CampusLocation.BOTH,
            course: "Campus Administration",
            yearOfStudy: "Staff",
            currentTerm: "Annual",
            affiliation: "Graphic Era Directorate",
            verificationStatus: VerificationStatus.VERIFIED,
          },
        },
      },
    });

    // 2. Graphic Era Students
    const studentsData = [
      {
        email: "kartikey@gehu.ac.in",
        fullName: "Kartikey Joshi",
        gender: Gender.MALE,
        campus: CampusLocation.GEHU,
        course: "B.Tech Computer Science & Engg.",
        yearOfStudy: "2nd Year",
        currentTerm: "4th Sem (2nd Yr)",
        affiliation: "GEHU Dehradun",
        studentIdPrefix: "GEHU-CSE-2023",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
        bio: "2nd year CSE student at Graphic Era Hill University Bell Road. Passionate about full-stack dev and hackathons. Looking for a neat, focused roommate.",
        pref: {
          preferredGender: PreferredGenderRule.SAME_GENDER_ONLY,
          budgetMin: 7000,
          budgetMax: 10000,
          targetLocations: ["Bell Road", "Clement Town Market", "Subhash Nagar"],
          sleepCycle: SleepCycle.EARLY_BIRD,
          diet: DietHabit.PURE_VEGETARIAN,
          cleanliness: CleanlinessHabit.DAILY_HIGH,
          smoking: SmokingHabit.NON_SMOKER,
          studyHabit: StudyHabit.QUIET_ALONE,
          hobbies: ["Coding", "Badminton", "Tech Podcasts"],
        },
      },
      {
        email: "aarav@gehu.ac.in",
        fullName: "Aarav Sharma",
        gender: Gender.MALE,
        campus: CampusLocation.GEHU,
        course: "B.Tech Computer Science & Engg.",
        yearOfStudy: "2nd Year",
        currentTerm: "4th Sem (2nd Yr)",
        affiliation: "GEHU Dehradun",
        studentIdPrefix: "GEHU-CSE-2023",
        avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80",
        bio: "Morning person, pure veg, high cleanliness. Prep for competitive coding and semester exams. Looking for a quiet flat near Bell Road.",
        pref: {
          preferredGender: PreferredGenderRule.SAME_GENDER_ONLY,
          budgetMin: 7500,
          budgetMax: 11000,
          targetLocations: ["Bell Road", "Subhash Nagar Chowk"],
          sleepCycle: SleepCycle.EARLY_BIRD,
          diet: DietHabit.PURE_VEGETARIAN,
          cleanliness: CleanlinessHabit.DAILY_HIGH,
          smoking: SmokingHabit.NON_SMOKER,
          studyHabit: StudyHabit.QUIET_ALONE,
          hobbies: ["Algorithms", "Running", "Chess"],
        },
      },
      {
        email: "rohan@geu.ac.in",
        fullName: "Rohan Verma",
        gender: Gender.MALE,
        campus: CampusLocation.GEU_MAIN,
        course: "B.Tech Mechanical Engineering",
        yearOfStudy: "3rd Year",
        currentTerm: "6th Sem (3rd Yr)",
        affiliation: "GEU Clement Town",
        studentIdPrefix: "GEU-ME-2022",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        bio: "Night owl, non-veg, gym enthusiast. Looking for a chilled flatmate for a 2BHK flat near Clement Town Lake.",
        pref: {
          preferredGender: PreferredGenderRule.SAME_GENDER_ONLY,
          budgetMin: 6000,
          budgetMax: 9000,
          targetLocations: ["Clement Town Market", "Subhash Nagar"],
          sleepCycle: SleepCycle.NIGHT_OWL,
          diet: DietHabit.NON_VEGETARIAN,
          cleanliness: CleanlinessHabit.MODERATE_WEEKLY,
          smoking: SmokingHabit.NON_SMOKER,
          studyHabit: StudyHabit.MUSIC_BACKGROUND,
          hobbies: ["Gym", "Gaming", "Motorcycles"],
        },
      },
      {
        email: "priya@gehu.ac.in",
        fullName: "Priya Nautiyal",
        gender: Gender.FEMALE,
        campus: CampusLocation.GEHU,
        course: "MBA (Hospitality & Management)",
        yearOfStudy: "1st Year",
        currentTerm: "2nd Sem (1st Yr)",
        affiliation: "GEHU Dehradun",
        studentIdPrefix: "GEHU-MBA-2024",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        bio: "MBA student looking for safe, peaceful girls accommodation near Turner Road or Subhash Nagar.",
        pref: {
          preferredGender: PreferredGenderRule.SAME_GENDER_ONLY,
          budgetMin: 8000,
          budgetMax: 12000,
          targetLocations: ["Turner Road", "Subhash Nagar"],
          sleepCycle: SleepCycle.EARLY_BIRD,
          diet: DietHabit.PURE_VEGETARIAN,
          cleanliness: CleanlinessHabit.DAILY_HIGH,
          smoking: SmokingHabit.NON_SMOKER,
          studyHabit: StudyHabit.QUIET_ALONE,
          hobbies: ["Reading", "Yoga", "Baking"],
        },
      },
    ];

    for (const student of studentsData) {
      await prisma.user.upsert({
        where: { email: student.email },
        update: {},
        create: {
          email: student.email,
          passwordHash: defaultPasswordHash,
          role: UserRole.STUDENT,
          isEmailVerified: true,
          isDemo: false,
          studentProfile: {
            create: {
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
              verificationStatus: VerificationStatus.VERIFIED,
              roommatePreference: {
                create: {
                  isLive: true,
                  preferredGender: student.pref.preferredGender,
                  budgetMin: student.pref.budgetMin,
                  budgetMax: student.pref.budgetMax,
                  targetLocations: student.pref.targetLocations,
                  sleepCycle: student.pref.sleepCycle,
                  diet: student.pref.diet,
                  cleanliness: student.pref.cleanliness,
                  smoking: student.pref.smoking,
                  studyHabit: student.pref.studyHabit,
                  hobbies: student.pref.hobbies,
                },
              },
            },
          },
        },
      });
    }

    console.log(`✅ Seeded student accounts.`);

    // 3. Accommodation Listings (All 8 Verified Listings)
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
        totalBedsLeft: 0,
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
      const existing = await prisma.listing.findUnique({
        where: { slug: item.slug },
      });

      if (!existing) {
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
    }

    console.log("✅ Seeded all accommodation listings.");

    const [userCount, listingCount] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
    ]);

    console.log(`\n🎉 Production Seed Completed!`);
    console.log(`Total Verified Users in Neon: ${userCount}`);
    console.log(`Total Accommodation Listings in Neon: ${listingCount}`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("❌ Seeding failed:", errorMsg);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    proxy.close();
  }
}

seedProduction();
