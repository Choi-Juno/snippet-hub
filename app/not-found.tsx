// app/not-found.tsx
"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            <div className="max-w-md w-full text-center">
                {/* 404 큰 텍스트 */}
                <div className="mb-6">
                    <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-400">
                        404
                    </h1>
                </div>

                {/* 아이콘 */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6">
                    <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>

                {/* 메시지 */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Page Not Found
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has
                    been moved.
                </p>

                {/* 버튼들 */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/dashboard">
                        <Button variant="default" className="w-full sm:w-auto">
                            <Home className="w-4 h-4 mr-2" />
                            Go to Dashboard
                        </Button>
                    </Link>
                    <Button
                        onClick={() => window.history.back()}
                        variant="outline"
                        className="w-full sm:w-auto"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>

                {/* 추천 링크 */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                        Popular pages:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm">
                                Dashboard
                            </Button>
                        </Link>
                        <Link href="/dashboard/snippets/new">
                            <Button variant="ghost" size="sm">
                                Create Snippet
                            </Button>
                        </Link>
                        <Link href="/dashboard/favorites">
                            <Button variant="ghost" size="sm">
                                Favorites
                            </Button>
                        </Link>
                        <Link href="/dashboard/tags">
                            <Button variant="ghost" size="sm">
                                Tags
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
