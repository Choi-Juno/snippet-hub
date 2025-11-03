"use client";

import { useAuthStore } from "@/src/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        // 사용자가 로그인하지 않았으면 로그인 페이지로 이동
        if (user === null) {
            router.push("/login");
        }
    }, [user, router]);

    // 로그인하지 않았으면 아무것도 보여주지 않음
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto">
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }
    // 로그인했으면 children을 보여줌
    return <>{children}</>;
}
