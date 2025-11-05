// app/(app)/dashboard/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/src/supabase/client";
import { useAuthStore } from "@/src/stores/authStore";
import { SnippetWithTags, Tag, Snippet } from "@/src/types/database";
import { SnippetCard } from "@/src/components/snippet/SnippetCard";
import { StatsCard } from "@/src/components/dashboard/StatsCard";
import { Search, Star, ArrowUpDown, Code2, Heart, Layers } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/src/components/editor/LanguageSelector";
import { toast } from "sonner";

type SortOption = "newest" | "oldest" | "title-asc" | "title-desc" | "language";

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user);
    const [snippets, setSnippets] = useState<SnippetWithTags[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [languageFilter, setLanguageFilter] = useState<string>("all");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const searchInputRef = useRef<HTMLInputElement>(null);

    // 스니펫 불러오기 (태그 포함)
    useEffect(() => {
        if (!user) return;

        const fetchSnippets = async () => {
            setLoading(true);

            // 1. 스니펫 조회
            const { data: snippetsData, error: snippetsError } = await supabase
                .from("snippets")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (snippetsError) {
                console.error("Error fetching snippets:", snippetsError);
                setLoading(false);
                return;
            }

            // 2. 각 스니펫의 태그 조회
            console.log("=== Dashboard: Fetched Snippets ===");
            console.log("Total snippets:", snippetsData.length);
            snippetsData.forEach((snippet: Snippet, index: number) => {
                console.log(`Snippet ${index + 1}:`, {
                    id: snippet.id,
                    title: snippet.title,
                    idType: typeof snippet.id,
                    idLength: snippet.id?.length,
                });
            });

            const snippetsWithTags = await Promise.all(
                snippetsData.map(async (snippet: Snippet) => {
                    const { data: tagData } = await supabase
                        .from("snippet_tags")
                        .select(
                            `
                            tags (
                                id,
                                name,
                                created_at
                            )
                        `
                        )
                        .eq("snippet_id", snippet.id);

                    interface SnippetTagWithTag {
                        tags: Tag | null;
                    }

                    const tags =
                        (tagData as unknown as SnippetTagWithTag[])
                            ?.map((item) => item.tags)
                            .filter((tag): tag is Tag => tag !== null) || [];

                    return {
                        ...snippet,
                        tags,
                    };
                })
            );

            setSnippets(snippetsWithTags);
            setLoading(false);
        };

        fetchSnippets();
    }, [user]);

    // 빠른 검색 단축키 (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // 코드 복사 기능
    const handleCopy = async (code: string) => {
        await navigator.clipboard.writeText(code);
        toast.success("Code copied to clipboard!");
    };

    // 마크다운 형식으로 복사
    const handleCopyMarkdown = async (
        code: string,
        language: string,
        title: string
    ) => {
        const markdown = `# ${title}\n\n\`\`\`${language}\n${code}\n\`\`\``;
        await navigator.clipboard.writeText(markdown);
        toast.success("Code copied as Markdown!");
    };

    // 스니펫 삭제
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this snippet?")) return;

        const { error } = await supabase.from("snippets").delete().eq("id", id);

        if (error) {
            console.error("Error deleting snippet:", error);
            toast.error("Failed to delete snippet");
        } else {
            setSnippets(snippets.filter((s) => s.id !== id));
        }
    };

    // 즐겨찾기 토글
    const handleToggleFavorite = async (id: string) => {
        const snippet = snippets.find((s) => s.id === id);
        if (!snippet) return;

        const newFavoriteState = !snippet.is_favorite;

        const { error } = await supabase
            .from("snippets")
            .update({ is_favorite: newFavoriteState })
            .eq("id", id);

        if (error) {
            console.error("Error toggling favorite:", error);
            toast.error("Failed to update favorite");
        } else {
            setSnippets(
                snippets.map((s) =>
                    s.id === id ? { ...s, is_favorite: newFavoriteState } : s
                )
            );
        }
    };

    // 필터링된 스니펫
    const filteredSnippets = snippets
        .filter((snippet) => {
            // 검색 필터
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                snippet.title.toLowerCase().includes(query) ||
                snippet.description?.toLowerCase().includes(query) ||
                snippet.code.toLowerCase().includes(query) ||
                snippet.tags?.some((tag) =>
                    tag.name.toLowerCase().includes(query)
                );

            // 언어 필터
            const matchesLanguage =
                languageFilter === "all" || snippet.language === languageFilter;

            // 즐겨찾기 필터
            const matchesFavorite = !showFavoritesOnly || snippet.is_favorite;

            return matchesSearch && matchesLanguage && matchesFavorite;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return (
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    );
                case "oldest":
                    return (
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                    );
                case "title-asc":
                    return a.title.localeCompare(b.title);
                case "title-desc":
                    return b.title.localeCompare(a.title);
                case "language":
                    return a.language.localeCompare(b.language);
                default:
                    return 0;
            }
        });

    // 통계 계산
    const totalSnippets = snippets.length;
    const favoriteCount = snippets.filter((s) => s.is_favorite).length;

    // 가장 많이 사용한 언어
    const languageCounts = snippets.reduce((acc, snippet) => {
        acc[snippet.language] = (acc[snippet.language] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topLanguage = Object.entries(languageCounts).sort(
        ([, a], [, b]) => b - a
    )[0];

    const topLanguageText = topLanguage
        ? `${topLanguage[0]} (${topLanguage[1]})`
        : "None";

    // 로딩 중
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading snippets...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* 헤더 */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    My Snippets
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage and organize your code snippets
                </p>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    title="Total Snippets"
                    value={totalSnippets}
                    icon={Code2}
                    description={`${filteredSnippets.length} shown`}
                    color="blue"
                />
                <StatsCard
                    title="Favorites"
                    value={favoriteCount}
                    icon={Heart}
                    description={`${
                        Math.round((favoriteCount / totalSnippets) * 100) || 0
                    }% of total`}
                    color="pink"
                />
                <StatsCard
                    title="Top Language"
                    value={topLanguageText}
                    icon={Layers}
                    description={`${
                        Object.keys(languageCounts).length
                    } languages used`}
                    color="purple"
                />
            </div>

            {/* 검색 및 필터 */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                {/* 검색 */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search snippets... (⌘K or Ctrl+K)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* 언어 필터 */}
                <Select
                    value={languageFilter}
                    onValueChange={setLanguageFilter}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Languages</SelectItem>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* 정렬 */}
                <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as SortOption)}
                >
                    <SelectTrigger className="w-[180px]">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                        <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                        <SelectItem value="language">Language</SelectItem>
                    </SelectContent>
                </Select>

                {/* 즐겨찾기 필터 */}
                <Button
                    variant={showFavoritesOnly ? "default" : "outline"}
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                >
                    <Star
                        className={`w-4 h-4 mr-2 ${
                            showFavoritesOnly ? "fill-current" : ""
                        }`}
                    />
                    Favorites
                </Button>
            </div>

            {/* 스니펫 목록 */}
            {filteredSnippets.length === 0 ? (
                // 빈 상태
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchQuery ||
                        languageFilter !== "all" ||
                        showFavoritesOnly
                            ? "No snippets found"
                            : "No snippets yet"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchQuery ||
                        languageFilter !== "all" ||
                        showFavoritesOnly
                            ? "Try adjusting your search or filters"
                            : "Create your first code snippet to get started"}
                    </p>
                    {!searchQuery &&
                        languageFilter === "all" &&
                        !showFavoritesOnly && (
                            <Button asChild>
                                <Link href="/dashboard/snippets/new">
                                    Create Snippet
                                </Link>
                            </Button>
                        )}
                </div>
            ) : (
                // 그리드로 스니펫 카드 표시
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSnippets.map((snippet) => (
                        <SnippetCard
                            key={snippet.id}
                            snippet={snippet}
                            onCopy={handleCopy}
                            onCopyMarkdown={handleCopyMarkdown}
                            onDelete={handleDelete}
                            onToggleFavorite={handleToggleFavorite}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
