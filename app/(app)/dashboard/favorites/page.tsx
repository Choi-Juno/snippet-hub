// app/(app)/dashboard/favorites/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/supabase/client";
import { useAuthStore } from "@/src/stores/authStore";
import { SnippetWithTags, Tag } from "@/src/types/database";
import { SnippetCard } from "@/src/components/snippet/SnippetCard";
import { Search, Star } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/src/components/editor/LanguageSelector";

export default function FavoritesPage() {
    const user = useAuthStore((state) => state.user);
    const [snippets, setSnippets] = useState<SnippetWithTags[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [languageFilter, setLanguageFilter] = useState<string>("all");

    // 즐겨찾기 스니펫 불러오기
    useEffect(() => {
        if (!user) return;

        const fetchFavorites = async () => {
            setLoading(true);

            // 1. 즐겨찾기 스니펫 조회
            const { data: snippetsData, error: snippetsError } = await supabase
                .from("snippets")
                .select("*")
                .eq("user_id", user.id)
                .eq("is_favorite", true)
                .order("created_at", { ascending: false });

            if (snippetsError) {
                console.error("Error fetching snippets:", snippetsError);
                setLoading(false);
                return;
            }

            // 2. 각 스니펫의 태그 조회
            const snippetsWithTags = await Promise.all(
                snippetsData.map(async (snippet) => {
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

        fetchFavorites();
    }, [user]);

    // 코드 복사 기능
    const handleCopy = async (code: string) => {
        await navigator.clipboard.writeText(code);
        alert("Code copied to clipboard!");
    };

    // 스니펫 삭제
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this snippet?")) return;

        const { error } = await supabase.from("snippets").delete().eq("id", id);

        if (error) {
            console.error("Error deleting snippet:", error);
            alert("Failed to delete snippet");
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
            alert("Failed to update favorite");
        } else {
            // 즐겨찾기에서 제거되면 목록에서 삭제
            if (!newFavoriteState) {
                setSnippets(snippets.filter((s) => s.id !== id));
            } else {
                setSnippets(
                    snippets.map((s) =>
                        s.id === id
                            ? { ...s, is_favorite: newFavoriteState }
                            : s
                    )
                );
            }
        }
    };

    // 필터링된 스니펫
    const filteredSnippets = snippets.filter((snippet) => {
        // 검색 필터
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            snippet.title.toLowerCase().includes(query) ||
            snippet.description?.toLowerCase().includes(query) ||
            snippet.code.toLowerCase().includes(query) ||
            snippet.tags?.some((tag) => tag.name.toLowerCase().includes(query));

        // 언어 필터
        const matchesLanguage =
            languageFilter === "all" || snippet.language === languageFilter;

        return matchesSearch && matchesLanguage;
    });

    // 로딩 중
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Loading favorites...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* 헤더 */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Favorite Snippets
                    </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    You have {snippets.length} favorite snippet
                    {snippets.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* 검색 및 필터 */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                {/* 검색 */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search favorite snippets..."
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
            </div>

            {/* 스니펫 목록 */}
            {filteredSnippets.length === 0 ? (
                // 빈 상태
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mb-4">
                        <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {searchQuery || languageFilter !== "all"
                            ? "No snippets found"
                            : "No favorite snippets yet"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {searchQuery || languageFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Click the star icon on snippets to add them to favorites"}
                    </p>
                    {!searchQuery && languageFilter === "all" && (
                        <Button asChild>
                            <a href="/dashboard">Browse All Snippets</a>
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
                            onDelete={handleDelete}
                            onToggleFavorite={handleToggleFavorite}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
