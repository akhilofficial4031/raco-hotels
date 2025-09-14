import { z } from "zod";

export const CustomerDataSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  fullName: z.string().min(1, { message: "Full name is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  alternatePhone: z.string().optional(),
  nationality: z.string().optional(),
  idType: z.string().min(1, { message: "ID type is required" }),
  idNumber: z.string().min(1, { message: "ID number is required" }),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  notes: z.string().optional(),
  firstBookingSource: z
    .enum(["web", "front_office", "phone", "email", "mobile_app", "walk_in"])
    .optional(),
});

export type CustomerData = z.infer<typeof CustomerDataSchema>;
