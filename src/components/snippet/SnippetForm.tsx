// src/components/snippet/SnippetForm.tsx
"use client";

import { useState } from "react";
import { validateSnippet, validateTag } from "@/src/lib/validations/snippet";
import { CodeEditor } from "@/src/components/editor/CodeEditor";
import { LanguageSelector } from "@/src/components/editor/LanguageSelector";
import { TagInput } from "@/src/components/snippet/TagInput";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "sonner";

interface SnippetFormProps {
    initialData?: {
        title: string;
        description: string;
        code: string;
        language: string;
        tags: string[];
    };
    onSubmit: (data: {
        title: string;
        description: string;
        code: string;
        language: string;
        tags: string[];
    }) => Promise<void>;
    submitLabel?: string;
    isLoading?: boolean;
}

export function SnippetForm({
    initialData,
    onSubmit,
    submitLabel = "Submit",
    isLoading = false,
}: SnippetFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [code, setCode] = useState(initialData?.code || "");
    const [language, setLanguage] = useState(initialData?.language || "javascript");
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validate input
        const result = validateSnippet({
            title,
            description: description || null,
            code,
            language,
            tags,
        });

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.errors.forEach((error) => {
                const path = error.path[0] as string;
                fieldErrors[path] = error.message;
            });
            setErrors(fieldErrors);
            toast.error("Please fix the validation errors");
            return;
        }

        // Validate tags individually
        for (const tag of tags) {
            const tagResult = validateTag(tag);
            if (!tagResult.success) {
                toast.error(`Invalid tag "${tag}": ${tagResult.error.errors[0].message}`);
                return;
            }
        }

        try {
            await onSubmit(result.data);
        } catch (error) {
            console.error("Submit error:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="title"
                    placeholder="e.g., React useDebounce Hook"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2"
                    maxLength={100}
                />
                {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    {title.length}/100 characters
                </p>
            </div>

            {/* Language */}
            <div>
                <Label>
                    Language <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                    <LanguageSelector value={language} onChange={setLanguage} />
                </div>
                {errors.language && (
                    <p className="text-sm text-red-600 mt-1">{errors.language}</p>
                )}
            </div>

            {/* Code */}
            <div>
                <Label>
                    Code <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                    <CodeEditor
                        value={code}
                        onChange={setCode}
                        language={language}
                        height="400px"
                    />
                </div>
                {errors.code && (
                    <p className="text-sm text-red-600 mt-1">{errors.code}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    {code.length.toLocaleString()}/50,000 characters
                </p>
            </div>

            {/* Description */}
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Describe what this snippet does..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="mt-2"
                    maxLength={500}
                />
                {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    {description.length}/500 characters
                </p>
            </div>

            {/* Tags */}
            <div>
                <Label>Tags</Label>
                <div className="mt-2">
                    <TagInput
                        tags={tags}
                        onChange={setTags}
                        placeholder="Add tags (e.g., react, hooks, typescript)"
                    />
                </div>
                {errors.tags && (
                    <p className="text-sm text-red-600 mt-1">{errors.tags}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    {tags.length}/10 tags • Use letters, numbers, hyphens, and underscores only
                </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 justify-end pt-4 border-t">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Submitting..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}

