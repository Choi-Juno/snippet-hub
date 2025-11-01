"use client";

import { useAuthStore } from "@/src/stores/authStore";
import { supabase } from "@/src/supabase/client";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const setUser = useAuthStore((state) => state.setUser);

    useEffect(() => {
        // 현재 로그인한 사용자 가져오기
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // 로그인 상태 변화 감지
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [setUser]);

    return <>{children}</>;
}
