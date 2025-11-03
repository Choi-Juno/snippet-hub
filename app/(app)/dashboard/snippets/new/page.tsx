// app/(app)/dashboard/snippets/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/supabase/client";
import { useAuthStore } from "@/src/stores/authStore";
import { CodeEditor } from "@/src/components/editor/CodeEditor";
import { LanguageSelector } from "@/src/components/editor/LanguageSelector";
import { TagInput } from "@/src/components/snippet/TagInput";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewSnippetPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const authLoading = useAuthStore((state) => state.loading);

    // 폼 상태 관리
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 인증 로딩이 완료되었는지 확인
    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Loading user information...
                    </p>
                </div>
            </div>
        );
    }

    // 사용자가 로그인하지 않은 경우
    if (!user) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Authentication Required
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Please log in to create snippets.
                </p>
                <Button asChild>
                    <a href="/login">Go to Login</a>
                </Button>
            </div>
        );
    }

    // 스니펫 저장
    const handleSave = async () => {
        // 유효성 검사
        if (!user) {
            setError("User not authenticated. Please refresh the page.");
            return;
        }

        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        if (!code.trim()) {
            setError("Code is required");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log("=== Starting Snippet Creation ===");
            console.log("Current user:", user);
            console.log("User ID:", user.id);
            console.log("User ID type:", typeof user.id);

            // 1. 스니펫 생성
            const insertData = {
                user_id: user.id,
                title: title.trim(),
                description: description.trim() || null,
                code: code,
                language: language,
                is_favorite: false,
            };
            console.log("Insert data:", insertData);

            const { data: snippet, error: snippetError } = await supabase
                .from("snippets")
                .insert(insertData)
                .select()
                .single();

            console.log("=== Insert Response ===");
            console.log("Snippet data:", snippet);
            console.log("Snippet error:", snippetError);

            if (snippetError) {
                console.error("❌ Snippet error details:", snippetError);
                throw snippetError;
            }

            console.log("✅ Created snippet:", snippet);
            console.log("✅ Snippet ID:", snippet?.id);
            console.log("Snippet ID type:", typeof snippet?.id);
            console.log("Snippet ID length:", snippet?.id?.length);

            // snippet이 제대로 생성되었는지 확인
            if (!snippet || !snippet.id) {
                throw new Error("Failed to create snippet - no ID returned");
            }

            // 2. 태그 처리
            if (tags.length > 0) {
                // 기존 태그 확인 및 새 태그 생성
                for (const tagName of tags) {
                    // 태그가 이미 존재하는지 확인
                    const { data: existingTag } = await supabase
                        .from("tags")
                        .select("id")
                        .eq("name", tagName)
                        .single();

                    let tagId: string;

                    if (existingTag) {
                        tagId = existingTag.id;
                    } else {
                        // 새 태그 생성
                        const { data: newTag, error: tagError } = await supabase
                            .from("tags")
                            .insert({ name: tagName })
                            .select("id")
                            .single();

                        if (tagError) throw tagError;
                        tagId = newTag.id;
                    }

                    // snippet_tags에 연결
                    const { error: linkError } = await supabase
                        .from("snippet_tags")
                        .insert({
                            snippet_id: snippet.id,
                            tag_id: tagId,
                        });

                    if (linkError) throw linkError;
                }
            }

            // 성공하면 상세 페이지로 이동
            const redirectUrl = `/dashboard/snippets/${snippet.id}`;
            console.log("=== Preparing Redirect ===");
            console.log("Final snippet.id:", snippet.id);
            console.log("Redirect URL:", redirectUrl);

            // UUID 형식 확인
            const uuidRegex =
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const isValidUuid = uuidRegex.test(snippet.id);
            console.log("UUID validation result:", isValidUuid);

            if (!isValidUuid) {
                console.error("❌ Invalid UUID generated:", snippet.id);
                throw new Error("Invalid snippet ID format");
            }

            console.log("✅ Redirecting to:", redirectUrl);
            router.push(redirectUrl);
            console.log("✅ router.push() called");
        } catch (err) {
            console.error("Error saving snippet:", err);
            const errorMessage =
                err instanceof Error ? err.message : "Unknown error";
            setError(
                `Failed to save snippet: ${errorMessage}. Please try again.`
            );
            setLoading(false);
        }
    };

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
                    <h1 className="text-2xl font-bold">Create New Snippet</h1>
                </div>
                <Button onClick={handleSave} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save Snippet"}
                </Button>
            </div>

            {/* 에러 메시지 */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* 폼 */}
            <div className="space-y-6">
                {/* 제목 */}
                <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                        id="title"
                        placeholder="e.g., React useDebounce Hook"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-2"
                    />
                </div>

                {/* 언어 선택 */}
                <div>
                    <Label>Language *</Label>
                    <div className="mt-2">
                        <LanguageSelector
                            value={language}
                            onChange={setLanguage}
                        />
                    </div>
                </div>

                {/* 코드 에디터 */}
                <div>
                    <Label>Code *</Label>
                    <div className="mt-2">
                        <CodeEditor
                            value={code}
                            onChange={setCode}
                            language={language}
                            height="500px"
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        Tip: Use Ctrl+Space for autocomplete
                    </p>
                </div>

                {/* 설명 */}
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Describe what this snippet does..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="mt-2"
                    />
                </div>

                {/* 태그 */}
                <div>
                    <Label>Tags</Label>
                    <div className="mt-2">
                        <TagInput
                            tags={tags}
                            onChange={setTags}
                            placeholder="Add tags (e.g., react, hooks, typescript)"
                        />
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                    <Link href="/dashboard">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button onClick={handleSave} disabled={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Saving..." : "Save Snippet"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
