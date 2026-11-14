import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).default("MALE"),
  campus: z.enum(["GEHU", "GEU_MAIN", "BOTH"]).default("GEHU"),
  course: z.string().min(2, "Course must be specified").default("B.Tech CSE"),
  yearOfStudy: z.string().default("2nd Year"),
  currentTerm: z.string().default("4th Sem (2nd Yr)"),
  affiliation: z.string().default("GEHU Dehradun"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
