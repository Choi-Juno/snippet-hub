// src/components/editor/LanguageSelector.tsx
"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";

// 지원하는 언어 목록
export const SUPPORTED_LANGUAGES = [
    { value: "javascript", label: "JavaScript", icon: "🟨" },
    { value: "typescript", label: "TypeScript", icon: "🔷" },
    { value: "python", label: "Python", icon: "🐍" },
    { value: "java", label: "Java", icon: "☕" },
    { value: "go", label: "Go", icon: "🔵" },
    { value: "rust", label: "Rust", icon: "🦀" },
    { value: "cpp", label: "C++", icon: "⚙️" },
    { value: "csharp", label: "C#", icon: "💜" },
    { value: "php", label: "PHP", icon: "🐘" },
    { value: "ruby", label: "Ruby", icon: "💎" },
    { value: "swift", label: "Swift", icon: "🍎" },
    { value: "kotlin", label: "Kotlin", icon: "🟣" },
    { value: "sql", label: "SQL", icon: "🗄️" },
    { value: "html", label: "HTML", icon: "🌐" },
    { value: "css", label: "CSS", icon: "🎨" },
    { value: "json", label: "JSON", icon: "📄" },
    { value: "yaml", label: "YAML", icon: "📋" },
    { value: "markdown", label: "Markdown", icon: "📝" },
    { value: "bash", label: "Bash", icon: "💻" },
    { value: "plaintext", label: "Plain Text", icon: "📄" },
];

interface LanguageSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                        <span className="flex items-center gap-2">
                            <span>{lang.icon}</span>
                            <span>{lang.label}</span>
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
