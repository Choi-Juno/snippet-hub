// src/components/snippet/SnippetCard.tsx
"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Copy, Star, Trash2, ChevronDown } from "lucide-react";
import { SnippetWithTags } from "@/src/types/database";
import { Badge } from "@/src/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
    vscDarkPlus,
    vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

interface SnippetCardProps {
    snippet: SnippetWithTags;
    onCopy?: (code: string) => void;
    onCopyMarkdown?: (code: string, language: string, title: string) => void;
    onDelete?: (id: string) => void;
    onToggleFavorite?: (id: string) => void;
}

export function SnippetCard({
    snippet,
    onCopy,
    onCopyMarkdown,
    onDelete,
    onToggleFavorite,
}: SnippetCardProps) {
    const { theme } = useTheme();
    // 언어별 색상 매핑
    const languageColors: Record<string, string> = {
        javascript:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        typescript:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        python: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        java: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        cpp: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        go: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
        rust: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        ruby: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
    };

    const languageColor =
        languageColors[snippet.language.toLowerCase()] ||
        "bg-gray-100 text-gray-800";

    // 상대적 시간 표시 (예: "2일 전")
    const timeAgo = formatDistanceToNow(new Date(snippet.created_at), {
        addSuffix: true,
        locale: ko,
    });

    // 코드 미리보기 (첫 5줄)
    const previewCode = snippet.code.split("\n").slice(0, 5).join("\n");
    const totalLines = snippet.code.split("\n").length;
    const hasMoreLines = totalLines > 5;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow relative">
            <Link
                href={`/dashboard/snippets/${snippet.id}`}
                className="block p-4"
            >
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg hover:text-blue-600 dark:text-white transition-colors">
                                {snippet.title}
                            </h3>
                            {snippet.is_favorite && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                        </div>
                    </div>

                    {/* 액션 버튼들 */}
                    <div className="flex gap-2 ml-2 relative z-10">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleFavorite?.(snippet.id);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            title="Favorite"
                        >
                            <Star
                                className={`w-4 h-4 ${
                                    snippet.is_favorite
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-gray-400 hover:text-yellow-500"
                                }`}
                            />
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center gap-1"
                                    title="Copy code"
                                >
                                    <Copy className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                                    <ChevronDown className="w-3 h-3 text-gray-400" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onCopy?.(snippet.code);
                                    }}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Code
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onCopyMarkdown?.(
                                            snippet.code,
                                            snippet.language,
                                            snippet.title
                                        );
                                    }}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy as Markdown
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete?.(snippet.id);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                    </div>
                </div>

                {/* 설명 */}
                {snippet.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {snippet.description}
                    </p>
                )}

                {/* 태그 */}
                {snippet.tags && snippet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {snippet.tags.map((tag) => (
                            <Badge
                                key={tag.id}
                                variant="outline"
                                className="text-xs"
                            >
                                #{tag.name}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* 코드 미리보기 */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 mb-3 font-mono text-sm overflow-x-auto">
                    <SyntaxHighlighter
                        language={snippet.language}
                        code={snippet.code}
                        style={theme === "dark" ? vscDarkPlus : vs}
                        customStyle={{
                            margin: 0,
                            padding: "12px",
                            fontSize: "13px",
                            lineHeight: "1.6",
                            maxHeight: "150px",
                            overflow: "hidden",
                            background:
                                theme === "dark" ? "#1e1e1e" : "#f8f8f8",
                        }}
                    >
                        {previewCode}
                    </SyntaxHighlighter>
                    {hasMoreLines && (
                        <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700">
                            + {totalLines - 5} more lines
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="flex items-center justify-between text-sm">
                    <span
                        className={`px-2 py-1 rounded text-xs font-medium ${languageColor}`}
                    >
                        {snippet.language}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                        {timeAgo}
                    </span>
                </div>
            </Link>
        </div>
    );
}
