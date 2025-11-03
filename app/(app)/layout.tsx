import { Header } from "@/src/components/layout/Header";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { ProtectedRoute } from "@/src/components/providers/ProtectedRoute";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* 헤더 */}
                <Header />

                {/* 사이드바 + 메인 컨텐츠 */}
                <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-8">{children}</main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
