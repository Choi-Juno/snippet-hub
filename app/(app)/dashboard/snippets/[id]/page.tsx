// app/(app)/dashboard/snippets/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/supabase/client";
import { SnippetWithTags, Tag } from "@/src/types/database";
import { CodeEditor } from "@/src/components/editor/CodeEditor";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
    ArrowLeft,
    Copy,
    Edit,
    Trash2,
    Check,
    Calendar,
    Code2,
    Star,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export default function SnippetDetailPage() {
    const router = useRouter();
    const params = useParams();
    const snippetId = params.id as string;

    const [snippet, setSnippet] = useState<SnippetWithTags | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // 스니펫 불러오기 (태그 포함)
    useEffect(() => {
        const fetchSnippet = async () => {
            console.log("=== Snippet Detail Page ===");
            console.log("Raw params:", params);
            console.log("Params ID:", snippetId);
            console.log("Params ID type:", typeof snippetId);
            console.log("Params ID length:", snippetId?.length);

            // snippetId가 없거나 잘못된 경우
            if (
                !snippetId ||
                snippetId === "undefined" ||
                snippetId === "null"
            ) {
                console.error("Missing or invalid snippetId:", snippetId);
                alert("잘못된 스니펫 ID입니다. (ID가 없음)");
                router.push("/dashboard");
                return;
            }

            // UUID 유효성 검사
            const uuidRegex =
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(snippetId)) {
                console.error("Invalid UUID format:", snippetId);
                console.error("UUID regex test failed");
                alert(
                    `잘못된 스니펫 ID 형식입니다.\nID: ${snippetId}\n\n올바른 UUID 형식이 아닙니다.`
                );
                router.push("/dashboard");
                return;
            }

            console.log("UUID validation passed ✓");

            // 1. 스니펫 조회
            const { data: snippetData, error: snippetError } = await supabase
                .from("snippets")
                .select("*")
                .eq("id", snippetId)
                .single();

            console.log("Snippet data:", snippetData);
            console.log("Snippet error:", snippetError);

            if (snippetError) {
                console.error("Error fetching snippet:", snippetError);

                // RLS 정책 에러인 경우
                if (
                    snippetError.code === "PGRST116" ||
                    snippetError.message.includes("Row level security")
                ) {
                    alert(
                        "이 스니펫에 접근할 권한이 없습니다. 본인이 생성한 스니펫만 볼 수 있습니다."
                    );
                } else {
                    alert(
                        `스니펫을 불러올 수 없습니다: ${snippetError.message}\n\n해결 방법:\n1. FIX_USER_ID.sql 파일을 Supabase에서 실행\n2. 새로운 스니펫을 생성`
                    );
                }
                router.push("/dashboard");
                return;
            }

            if (!snippetData) {
                console.error("No snippet found with ID:", snippetId);
                alert(
                    "스니펫을 찾을 수 없습니다. user_id가 설정되지 않은 스니펫일 수 있습니다."
                );
                router.push("/dashboard");
                return;
            }

            // 2. 태그 조회
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
                .eq("snippet_id", snippetId);

            interface SnippetTagWithTag {
                tags: Tag | null;
            }

            const tags =
                (tagData as unknown as SnippetTagWithTag[])
                    ?.map((item) => item.tags)
                    .filter((tag): tag is Tag => tag !== null) || [];

            setSnippet({
                ...snippetData,
                tags,
            });
            setLoading(false);
        };

        fetchSnippet();
    }, [snippetId, router, params]);

    // 코드 복사
    const handleCopy = async () => {
        if (!snippet) return;

        await navigator.clipboard.writeText(snippet.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 즐겨찾기 토글
    const handleToggleFavorite = async () => {
        if (!snippet) return;

        const newFavoriteState = !snippet.is_favorite;

        const { error } = await supabase
            .from("snippets")
            .update({ is_favorite: newFavoriteState })
            .eq("id", snippet.id);

        if (error) {
            alert("Failed to update favorite");
        } else {
            setSnippet({
                ...snippet,
                is_favorite: newFavoriteState,
            });
        }
    };

    // 삭제
    const handleDelete = async () => {
        if (!snippet) return;
        if (!confirm("Are you sure you want to delete this snippet?")) return;

        const { error } = await supabase
            .from("snippets")
            .delete()
            .eq("id", snippet.id);

        if (error) {
            alert("Failed to delete snippet");
        } else {
            router.push("/dashboard");
        }
    };

    // 로딩 중
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // 스니펫이 없으면
    if (!snippet) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900">
                    Snippet not found
                </h2>
                <Link href="/dashboard">
                    <Button className="mt-4">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const timeAgo = formatDistanceToNow(new Date(snippet.created_at), {
        addSuffix: true,
        locale: ko,
    });

    return (
        <div className="max-w-5xl">
            {/* 헤더 */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleToggleFavorite}>
                        <Star
                            className={`w-4 h-4 mr-2 ${
                                snippet.is_favorite
                                    ? "fill-yellow-500 text-yellow-500"
                                    : ""
                            }`}
                        />
                        {snippet.is_favorite ? "Unfavorite" : "Favorite"}
                    </Button>
                    <Button variant="outline" onClick={handleCopy}>
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                            </>
                        )}
                    </Button>
                    <Link href={`/dashboard/snippets/${snippet.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* 제목 및 메타 정보 */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {snippet.title}
                    </h1>
                    {snippet.is_favorite && (
                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <Code2 className="w-4 h-4" />
                        <span className="font-medium">{snippet.language}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created {timeAgo}</span>
                    </div>
                </div>
            </div>

            {/* 태그 */}
            {snippet.tags && snippet.tags.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">
                        Tags
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {snippet.tags.map((tag) => (
                            <Badge
                                key={tag.id}
                                variant="secondary"
                                className="text-sm"
                            >
                                #{tag.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* 설명 */}
            {snippet.description && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h2 className="text-sm font-semibold text-blue-900 mb-2">
                        Description
                    </h2>
                    <p className="text-blue-800">{snippet.description}</p>
                </div>
            )}

            {/* 코드 에디터 (읽기 전용) */}
            <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                    Code
                </h2>
                <CodeEditor
                    value={snippet.code}
                    onChange={() => {}}
                    language={snippet.language}
                    height="600px"
                    readOnly={true}
                />
            </div>
        </div>
    );
}
