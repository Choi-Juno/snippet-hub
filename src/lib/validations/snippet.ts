// src/lib/validations/snippet.ts
import { z } from "zod";

/**
 * Snippet Validation Schema
 * 
 * Defines validation rules for creating and updating snippets
 */

export const snippetSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title must be less than 100 characters")
        .trim(),
    
    description: z
        .string()
        .max(500, "Description must be less than 500 characters")
        .trim()
        .optional()
        .nullable(),
    
    code: z
        .string()
        .min(1, "Code is required")
        .max(50000, "Code must be less than 50,000 characters"),
    
    language: z
        .string()
        .min(1, "Language is required")
        .max(50, "Language must be less than 50 characters"),
    
    tags: z
        .array(z.string().min(1).max(30))
        .max(10, "Maximum 10 tags allowed")
        .optional()
        .default([]),
    
    is_favorite: z.boolean().optional().default(false),
});

export type SnippetInput = z.infer<typeof snippetSchema>;

/**
 * Validate snippet creation/update input
 */
export function validateSnippet(data: unknown) {
    return snippetSchema.safeParse(data);
}

/**
 * Tag validation
 */
export const tagSchema = z
    .string()
    .min(1, "Tag cannot be empty")
    .max(30, "Tag must be less than 30 characters")
    .regex(/^[a-zA-Z0-9-_]+$/, "Tag can only contain letters, numbers, hyphens, and underscores");

export function validateTag(tag: string) {
    return tagSchema.safeParse(tag);
}

/**
 * Search query validation
 */
export const searchQuerySchema = z
    .string()
    .max(200, "Search query is too long")
    .optional();

export function validateSearchQuery(query: string) {
    return searchQuerySchema.safeParse(query);
}

