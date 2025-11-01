"use client";

import { useAuthStore } from "@/src/stores/authStore";
import { supabase } from "@/src/supabase/client";
import { Code2, LogOut, User } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function Header() {
    const user = useAuthStore((state) => state.user);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <header className="border-b bg-white">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 font-bold text-xl"
                >
                    <Code2 className="w-6 h-6 text-blue-600" />
                    <span>SnippetHub</span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link href="/dashboard">
                                <Button variant="ghost">Dashboard</Button>
                            </Link>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="text-sm">{user.email}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSignOut}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link href="/signup">
                                <Button>Sign Up</Button>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
