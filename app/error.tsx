// app/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // 에러 로깅 (나중에 Sentry 연동)
        console.error("Global error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            <div className="max-w-md w-full text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Something went wrong!
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {error.message ||
                        "An unexpected error occurred. Please try again."}
                </p>

                <div className="flex gap-3 justify-center">
                    <Button onClick={() => reset()} variant="default">
                        Try again
                    </Button>
                    <Button
                        onClick={() => (window.location.href = "/dashboard")}
                        variant="outline"
                    >
                        Go to Dashboard
                    </Button>
                </div>

                {process.env.NODE_ENV === "development" && error.digest && (
                    <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            Error digest: {error.digest}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
