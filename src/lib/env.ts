// src/lib/env.ts
/**
 * Environment Variable Validation
 * 
 * This file validates required environment variables at build/runtime
 * to prevent deployment with missing configuration.
 */

interface EnvConfig {
    supabaseUrl: string;
    supabaseAnonKey: string;
    nodeEnv: string;
}

function validateEnv(): EnvConfig {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const nodeEnv = process.env.NODE_ENV || "development";

    // Validate Supabase URL
    if (!supabaseUrl) {
        throw new Error(
            "❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable.\n" +
            "Please check your .env.local file and make sure it's properly configured.\n" +
            "See .env.example for reference."
        );
    }

    if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes("supabase.co")) {
        throw new Error(
            "❌ Invalid NEXT_PUBLIC_SUPABASE_URL format.\n" +
            "Expected format: https://your-project-id.supabase.co"
        );
    }

    // Validate Supabase Anon Key
    if (!supabaseAnonKey) {
        throw new Error(
            "❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.\n" +
            "Please check your .env.local file and make sure it's properly configured.\n" +
            "See .env.example for reference."
        );
    }

    if (supabaseAnonKey.length < 100) {
        throw new Error(
            "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (too short).\n" +
            "Please verify you copied the correct anon/public key from Supabase."
        );
    }

    // Warn in production if using example values
    if (nodeEnv === "production") {
        if (supabaseUrl.includes("your-project-id")) {
            throw new Error(
                "❌ Production deployment detected with example Supabase URL.\n" +
                "Please update your environment variables with real values."
            );
        }

        if (supabaseAnonKey.includes("your-anon-key")) {
            throw new Error(
                "❌ Production deployment detected with example Supabase key.\n" +
                "Please update your environment variables with real values."
            );
        }
    }

    return {
        supabaseUrl,
        supabaseAnonKey,
        nodeEnv,
    };
}

// Validate on import (will throw error if validation fails)
export const env = validateEnv();

// Export individual values for convenience
export const { supabaseUrl, supabaseAnonKey, nodeEnv } = env;

// Helper to check if we're in production
export const isProduction = nodeEnv === "production";
export const isDevelopment = nodeEnv === "development";

// Log environment status in development
if (isDevelopment) {
    console.log("✅ Environment variables validated successfully");
    console.log("📍 Supabase URL:", supabaseUrl);
    console.log("🔑 Anon Key:", supabaseAnonKey.substring(0, 20) + "...");
}

