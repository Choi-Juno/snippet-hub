"use client";

import { cn } from "@/lib/utils";
import { Code2, Folder, Home, Settings, Star, Tag, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
    { name: "All snippets", href: "/dashboard", icon: Home },
    { name: "Favorites", href: "/dashboard/favorites", icon: Star },
    { name: "Folders", href: "/dashboard/folders", icon: Folder },
    { name: "Tags", href: "/dashboard/tags", icon: Tag },
    { name: "Workspaces", href: "/dashboard/workspaces", icon: Users },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r min-h-screen p-4">
            {/* 로고 영역 */}
            <div className="mb-8">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 font-bold text-lg"
                >
                    <Code2 className="w-6 h-6 text-blue-600" />
                    <span>SnippetHub</span>
                </Link>
            </div>

            {/* New Snippet 버튼 */}
            <Link href="/dashboard/snippets/new">
                <button className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 transition-colors mb-6">
                    + New Snippet
                </button>
            </Link>

            {/* 네비게이션 메뉴 */}
            <nav className="space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* 하단 설정 */}
            <div className="absolute bottom-4 left-4 right-4">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </Link>
            </div>
        </aside>
    );
}
