// app/(app)/dashboard/tags/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/src/supabase/client";
import { Tag, SnippetWithTags } from "@/src/types/database";
import { SnippetCard } from "@/src/components/snippet/SnippetCard";
import { Badge } from "@/src/components/ui/badge";
import { Search, Tag as TagIcon } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";

interface TagWithCount extends Tag {
    snippet_count: number;
}

export default function TagsPage() {
    const [tags, setTags] = useState<TagWithCount[]>([]);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [snippets, setSnippets] = useState<SnippetWithTags[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // 태그 목록 및 스니펫 수 가져오기
    useEffect(() => {
        const fetchTags = async () => {
            setLoading(true);

            // 1. 모든 태그 가져오기
            const { data: tagsData, error: tagsError } = await supabase
                .from("tags")
                .select("*")
                .order("name");

            if (tagsError) {
                console.error("Error fetching tags:", tagsError);
                setLoading(false);
                return;
            }

            // 2. 각 태그별 스니펫 수 계산
            const tagsWithCount = await Promise.all(
                tagsData.map(async (tag) => {
                    const { count } = await supabase
                        .from("snippet_tags")
                        .select("*", { count: "exact", head: true })
                        .eq("tag_id", tag.id);

                    return {
                        ...tag,
                        snippet_count: count || 0,
                    };
                })
            );

            // 스니펫 수가 많은 순으로 정렬
            tagsWithCount.sort((a, b) => b.snippet_count - a.snippet_count);
            setTags(tagsWithCount);
            setLoading(false);
        };

        fetchTags();
    }, []);

    // 선택된 태그의 스니펫 가져오기
    useEffect(() => {
        if (!selectedTag) {
            setTimeout(() => {
                setSnippets([]);
            }, 0);
            return;
        }

        const fetchSnippetsByTag = async () => {
            // 1. 선택된 태그를 가진 snippet_tags 조회
            const { data: snippetTagsData, error: snippetTagsError } =
                await supabase
                    .from("snippet_tags")
                    .select("snippet_id")
                    .eq("tag_id", selectedTag);

            if (snippetTagsError) {
                console.error("Error fetching snippet tags:", snippetTagsError);
                return;
            }

            const snippetIds = snippetTagsData.map((st) => st.snippet_id);

            if (snippetIds.length === 0) {
                setSnippets([]);
                return;
            }

            // 2. 해당 스니펫들 조회
            const { data: snippetsData, error: snippetsError } = await supabase
                .from("snippets")
                .select("*")
                .in("id", snippetIds)
                .order("created_at", { ascending: false });

            if (snippetsError) {
                console.error("Error fetching snippets:", snippetsError);
                return;
            }

            // 3. 각 스니펫의 태그 조회
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
        };

        fetchSnippetsByTag();
    }, [selectedTag]);

    // 스니펫 복사
    const handleCopy = async (code: string) => {
        await navigator.clipboard.writeText(code);
        toast.success("Code copied to clipboard!");
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
            toast.success("Snippet deleted successfully!");
            // 태그 목록 다시 로드 (스니펫 수 업데이트)
            window.location.reload();
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
            toast.success("Favorite updated successfully!");
        }
    };

    // 태그 검색 필터링
    const filteredTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 로딩 중
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading tags...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* 헤더 */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Tags
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Browse your snippets by tags ({tags.length} tag
                    {tags.length !== 1 ? "s" : ""})
                </p>
            </div>

            {/* 검색 */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {filteredTags.length === 0 ? (
                // 빈 상태
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <TagIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {searchQuery ? "No tags found" : "No tags yet"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {searchQuery
                            ? "Try adjusting your search query"
                            : "Create snippets with tags to see them here"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 왼쪽: 태그 목록 */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 p-4">
                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                All Tags
                            </h2>
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {filteredTags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        onClick={() =>
                                            setSelectedTag(
                                                selectedTag === tag.id
                                                    ? null
                                                    : tag.id
                                            )
                                        }
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                            selectedTag === tag.id
                                                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        <span className="font-medium">
                                            #{tag.name}
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {tag.snippet_count}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽: 선택된 태그의 스니펫 */}
                    <div className="lg:col-span-2">
                        {selectedTag ? (
                            <>
                                <div className="mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Snippets with #
                                        {
                                            tags.find(
                                                (t) => t.id === selectedTag
                                            )?.name
                                        }
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {snippets.length} snippet
                                        {snippets.length !== 1 ? "s" : ""}
                                    </p>
                                </div>

                                {snippets.length === 0 ? (
                                    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800">
                                        <p className="text-gray-600 dark:text-gray-400">
                                            No snippets found with this tag
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {snippets.map((snippet) => (
                                            <SnippetCard
                                                key={snippet.id}
                                                snippet={snippet}
                                                onCopy={handleCopy}
                                                onDelete={handleDelete}
                                                onToggleFavorite={
                                                    handleToggleFavorite
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800">
                                <div className="text-center py-12">
                                    <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Select a tag
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Click on a tag to see its snippets
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
