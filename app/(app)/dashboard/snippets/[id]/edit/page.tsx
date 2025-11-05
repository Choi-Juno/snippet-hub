// app/(app)/dashboard/snippets/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/supabase/client";
import { SnippetWithTags, Tag } from "@/src/types/database";
import { CodeEditor } from "@/src/components/editor/CodeEditor";
import { LanguageSelector } from "@/src/components/editor/LanguageSelector";
import { TagInput } from "@/src/components/snippet/TagInput";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditSnippetPage() {
    const router = useRouter();
    const params = useParams();
    const snippetId = params.id as string;

    const [snippet, setSnippet] = useState<SnippetWithTags | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 폼 상태
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [tags, setTags] = useState<string[]>([]);

    // 스니펫 불러오기 (태그 포함)
    useEffect(() => {
        const fetchSnippet = async () => {
            console.log("=== Snippet Edit Page ===");
            console.log("Params ID:", snippetId);

            // snippetId가 없거나 잘못된 경우
            if (
                !snippetId ||
                snippetId === "undefined" ||
                snippetId === "null"
            ) {
                console.error("Missing or invalid snippetId:", snippetId);
                toast.error("잘못된 스니펫 ID입니다.");
                router.push("/dashboard");
                return;
            }

            // UUID 유효성 검사
            const uuidRegex =
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(snippetId)) {
                console.error("Invalid UUID format:", snippetId);
                toast.error(`잘못된 스니펫 ID 형식입니다.\nID: ${snippetId}`);
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

            if (snippetError) {
                console.error("Error fetching snippet:", snippetError);
                toast.error(
                    `스니펫을 불러올 수 없습니다: ${snippetError.message}\n\n본인이 생성한 스니펫만 편집할 수 있습니다.`
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

            const fetchedTags =
                (tagData as unknown as SnippetTagWithTag[])
                    ?.map((item) => item.tags)
                    .filter((tag): tag is Tag => tag !== null) || [];

            const snippetWithTags = {
                ...snippetData,
                tags: fetchedTags,
            };

            setSnippet(snippetWithTags);

            // 폼에 기존 값 채우기
            setTitle(snippetData.title);
            setDescription(snippetData.description || "");
            setCode(snippetData.code);
            setLanguage(snippetData.language);
            setTags(fetchedTags.map((tag: Tag) => tag.name));

            setLoading(false);
        };

        fetchSnippet();
    }, [snippetId, router, params]);

    // 저장
    const handleSave = async () => {
        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        if (!code.trim()) {
            setError("Code is required");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            // 1. 스니펫 업데이트
            const { error: updateError } = await supabase
                .from("snippets")
                .update({
                    title: title.trim(),
                    description: description.trim() || null,
                    code: code,
                    language: language,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", snippetId);

            if (updateError) throw updateError;

            // 2. 기존 태그 연결 삭제
            await supabase
                .from("snippet_tags")
                .delete()
                .eq("snippet_id", snippetId);

            // 3. 새 태그 추가
            if (tags.length > 0) {
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
                    await supabase.from("snippet_tags").insert({
                        snippet_id: snippetId,
                        tag_id: tagId,
                    });
                }
            }

            // 성공하면 상세 페이지로 이동
            toast.success("Snippet updated successfully!");
            router.push(`/dashboard/snippets/${snippetId}`);
        } catch (err) {
            console.error("Error updating snippet:", err);
            setError("Failed to update snippet. Please try again.");
            toast.error("Failed to update snippet");
            setSaving(false);
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

    return (
        <div className="max-w-5xl">
            {/* 헤더 */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/snippets/${snippetId}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Edit Snippet</h1>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
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
                    <Link href={`/dashboard/snippets/${snippetId}`}>
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
