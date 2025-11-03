"use client";

import { useAuthStore } from "@/src/stores/authStore";
import { supabase } from "@/src/supabase/client";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const setUser = useAuthStore((state) => state.setUser);
    const setLoading = useAuthStore((state) => state.setLoading);

    useEffect(() => {
        console.log("AuthProvider: Initializing...");

        // 현재 로그인한 사용자 가져오기
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log("AuthProvider: Session loaded", session?.user);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 로그인 상태 변화 감지
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(
                "AuthProvider: Auth state changed",
                event,
                session?.user
            );
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [setUser, setLoading]);

    return <>{children}</>;
}
