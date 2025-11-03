"use client";

import { useAuthStore } from "@/src/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);

    useEffect(() => {
        // 로딩이 완료되고 사용자가 없으면 로그인 페이지로 이동
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // 로딩 중이거나 로그인하지 않았으면 로딩 화면 표시
    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // 로그인했으면 children을 보여줌
    return <>{children}</>;
}
