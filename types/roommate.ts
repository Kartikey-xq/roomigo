export interface RoommatePreferences {
  sleepCycle: string; // e.g. "Early Bird (10pm - 6am)" or "Night Owl (2am - 10am)"
  diet: string; // e.g. "Pure Vegetarian" or "Non-Vegetarian" or "Eggetarian"
  smoking: string; // e.g. "Non-Smoker"
  studyHabit: string; // e.g. "Quiet Study in Room"
  cleanliness: string; // e.g. "High / Cleans Daily"
  budget: string; // e.g. "₹6,000 - ₹9,000 /mo"
  hobbies: string[];
}

export interface Roommate {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  studentIdPrefix: string; // e.g. "GEHU/2023/..."
  college: "GEHU" | "GEU";
  course: string; // e.g. "B.Tech CSE"
  year: string; // e.g. "2nd Year"
  matchPercentage: number; // e.g. 96
  matchHighlight: {
    icon: "zap" | "gamepad" | "leaf" | "sparkles" | "book";
    text: string; // e.g. "96% Match • Early Bird & Pure Veg"
  };
  lookingFor: string; // e.g. "Bell Road PGs"
  bio: string;
  isOnline: boolean;
  // For Active Chats
  lastMessage?: {
    text: string;
    time: string;
    createdAt?: string;
    isDelivered: boolean;
    unreadCount: number;
  };
  // For Match Requests
  requestMessage?: string;
  requestedAt?: string;
  mutualTraits?: string[];
  // Living Preferences
  preferences: RoommatePreferences;
}
