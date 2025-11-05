// app/(app)/dashboard/settings/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/stores/authStore";
import { supabase } from "@/src/supabase/client";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card } from "@/src/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
    User,
    Palette,
    Download,
    Trash2,
    LogOut,
    FileJson,
    Shield,
} from "lucide-react";

export default function SettingsPage() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [stats, setStats] = useState({
        totalSnippets: 0,
        totalTags: 0,
        favoriteCount: 0,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // 통계 불러오기
    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;

            // 스니펫 수
            const { count: snippetCount } = await supabase
                .from("snippets")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id);

            // 즐겨찾기 수
            const { count: favoriteCount } = await supabase
                .from("snippets")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .eq("is_favorite", true);

            // 태그 수
            const { data: snippets } = await supabase
                .from("snippets")
                .select("id")
                .eq("user_id", user.id);

            const snippetIds = snippets?.map((s) => s.id) || [];

            if (snippetIds.length > 0) {
                const { data: tagData } = await supabase
                    .from("snippet_tags")
                    .select("tag_id")
                    .in("snippet_id", snippetIds);

                const uniqueTags = new Set(tagData?.map((t) => t.tag_id) || []);

                setStats({
                    totalSnippets: snippetCount || 0,
                    totalTags: uniqueTags.size,
                    favoriteCount: favoriteCount || 0,
                });
            } else {
                setStats({
                    totalSnippets: 0,
                    totalTags: 0,
                    favoriteCount: 0,
                });
            }
        };

        fetchStats();
    }, [user]);

    // Export all snippets as JSON
    const handleExportSnippets = async () => {
        setIsExporting(true);
        try {
            const { data: snippetsData, error: snippetsError } = await supabase
                .from("snippets")
                .select("*")
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false });

            if (snippetsError) throw snippetsError;

            // Get tags for each snippet
            const snippetsWithTags = await Promise.all(
                (snippetsData || []).map(async (snippet) => {
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

                    interface TagItem {
                        tags: {
                            id: string;
                            name: string;
                            created_at: string;
                        }[];
                    }
                    
                    const tags =
                        tagData
                            ?.flatMap((item: TagItem) => item.tags)
                            .filter((tag) => tag !== null) || [];

                    return {
                        ...snippet,
                        tags,
                    };
                })
            );

            // Create JSON file
            const exportData = {
                exportedAt: new Date().toISOString(),
                exportedBy: user?.email,
                snippetsCount: snippetsWithTags.length,
                snippets: snippetsWithTags,
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: "application/json",
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `snippethub-backup-${
                new Date().toISOString().split("T")[0]
            }.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`Exported ${snippetsWithTags.length} snippets!`);
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export snippets");
        } finally {
            setIsExporting(false);
        }
    };

    // Delete all snippets
    const handleDeleteAllSnippets = async () => {
        const confirmed = window.confirm(
            "⚠️ Are you sure you want to delete ALL snippets? This action cannot be undone!"
        );
        if (!confirmed) return;

        const doubleConfirm = window.prompt('Type "DELETE ALL" to confirm:');
        if (doubleConfirm !== "DELETE ALL") {
            toast.error("Deletion cancelled");
            return;
        }

        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from("snippets")
                .delete()
                .eq("user_id", user?.id);

            if (error) throw error;

            toast.success("All snippets deleted");
            router.push("/dashboard");
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete snippets");
        } finally {
            setIsDeleting(false);
        }
    };

    // Sign out
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        toast.success("Signed out successfully");
        router.push("/login");
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-600 dark:text-gray-400">
                    Please sign in to access settings
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage your account and preferences
                </p>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Profile
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={user.email || ""}
                                disabled
                                className="bg-gray-50 dark:bg-gray-800 mt-2"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Your email address is managed by your
                                authentication provider
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="user-id">User ID</Label>
                            <Input
                                id="user-id"
                                value={user.id || ""}
                                disabled
                                className="bg-gray-50 dark:bg-gray-800 font-mono text-xs mt-2"
                            />
                        </div>

                        {/* Stats */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Your Statistics
                            </p>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.totalSnippets}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Snippets
                                    </p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.favoriteCount}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Favorites
                                    </p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.totalTags}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Tags
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Appearance Section */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Appearance
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="theme">Theme</Label>
                            {mounted && (
                                <Select
                                    value={theme}
                                    onValueChange={(value) => setTheme(value)}
                                >
                                    <SelectTrigger id="theme" className="mt-2">
                                        <SelectValue placeholder="Select theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">
                                            ☀️ Light
                                        </SelectItem>
                                        <SelectItem value="dark">
                                            🌙 Dark
                                        </SelectItem>
                                        <SelectItem value="system">
                                            💻 System
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Choose your preferred color scheme
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Data Management Section */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <FileJson className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Data Management
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                                    Export Snippets
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Download all your snippets as a JSON file
                                    for backup
                                </p>
                            </div>
                            <Button
                                onClick={handleExportSnippets}
                                disabled={
                                    isExporting || stats.totalSnippets === 0
                                }
                                variant="outline"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {isExporting ? "Exporting..." : "Export"}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Security Section */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                            <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Security
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-900">
                            <div className="flex-1">
                                <h3 className="font-medium text-orange-900 dark:text-orange-400 mb-1">
                                    Sign Out
                                </h3>
                                <p className="text-sm text-orange-700 dark:text-orange-400">
                                    Sign out from your account on this device
                                </p>
                            </div>
                            <Button
                                onClick={handleSignOut}
                                variant="outline"
                                className="border-orange-300 dark:border-orange-700"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Danger Zone Section */}
                <Card className="p-6 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-red-900 dark:text-red-400">
                            Danger Zone
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {/* Delete All Snippets */}
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-900">
                            <div className="flex-1">
                                <h3 className="font-medium text-red-900 dark:text-red-400 mb-1">
                                    Delete All Snippets
                                </h3>
                                <p className="text-sm text-red-700 dark:text-red-400">
                                    Permanently delete all your code snippets.
                                    This action cannot be undone.
                                </p>
                            </div>
                            <Button
                                onClick={handleDeleteAllSnippets}
                                disabled={
                                    isDeleting || stats.totalSnippets === 0
                                }
                                variant="destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {isDeleting ? "Deleting..." : "Delete All"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
