import { z } from "zod";

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  course: z.string().optional(),
  yearOfStudy: z.string().optional(),
  currentTerm: z.string().optional(),
  affiliation: z.string().optional(),
  bio: z.string().max(500).optional(),
  phoneNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export const UpdatePreferenceSchema = z.object({
  isLive: z.boolean().optional(),
  preferredGender: z.enum(["SAME_GENDER_ONLY", "ANY_GENDER"]).optional(),
  budgetMin: z.number().int().min(2000).max(50000).optional(),
  budgetMax: z.number().int().min(2000).max(50000).optional(),
  targetLocations: z.array(z.string()).optional(),
  sleepCycle: z.enum(["EARLY_BIRD", "NIGHT_OWL", "FLEXIBLE"]).optional(),
  diet: z.enum(["PURE_VEGETARIAN", "EGGETARIAN", "NON_VEGETARIAN"]).optional(),
  cleanliness: z.enum(["DAILY_HIGH", "MODERATE_WEEKLY"]).optional(),
  smoking: z.enum(["NON_SMOKER", "OUTDOOR_ONLY", "SMOKER"]).optional(),
  studyHabit: z
    .enum(["QUIET_ALONE", "GROUP_STUDY", "MUSIC_BACKGROUND", "LATE_NIGHT_LIBRARY"])
    .optional(),
  hobbies: z.array(z.string()).optional(),
});
