// app/(app)/dashboard/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Dashboard error:", error);
    }, [error]);

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <Card className="p-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Oops! Something went wrong
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        We encountered an error while loading this page. Don't
                        worry, your data is safe.
                    </p>

                    <div className="flex gap-3 justify-center">
                        <Button onClick={reset} variant="default">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                        <Link href="/dashboard">
                            <Button variant="outline">
                                <Home className="w-4 h-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                    </div>

                    {process.env.NODE_ENV === "development" && (
                        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Error Details (Development Only):
                            </p>
                            <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                                {error.message}
                            </pre>
                            {error.stack && (
                                <pre className="text-xs text-gray-500 dark:text-gray-500 mt-2 overflow-auto max-h-40">
                                    {error.stack}
                                </pre>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
