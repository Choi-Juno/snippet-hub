// src/components/snippet/TagInput.tsx
"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export function TagInput({
    tags,
    onChange,
    placeholder = "Add tags...",
}: TagInputProps) {
    const [input, setInput] = useState("");

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim().toLowerCase();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            onChange([...tags, trimmedTag]);
        }
        setInput("");
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag(input);
        } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
            // 입력창이 비어있을 때 백스페이스 누르면 마지막 태그 제거
            removeTag(tags[tags.length - 1]);
        }
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                    <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1"
                    >
                        <span>#{tag}</span>
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:bg-gray-300 rounded-full p-0.5"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </Badge>
                ))}
            </div>
            <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
            />
            <p className="text-xs text-gray-500 mt-1">
                Press Enter to add tags, Backspace to remove
            </p>
        </div>
    );
}
