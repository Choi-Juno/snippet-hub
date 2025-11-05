// src/lib/validations/auth.ts
import { z } from "zod";

/**
 * Authentication Validation Schemas
 */

export const emailSchema = z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email is too long");

export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    );

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

export function validateLogin(data: unknown) {
    return loginSchema.safeParse(data);
}

export function validateSignup(data: unknown) {
    return signupSchema.safeParse(data);
}

