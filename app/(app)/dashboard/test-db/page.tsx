// app/(app)/dashboard/test-db/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/src/supabase/client";
import { useAuthStore } from "@/src/stores/authStore";
import { Button } from "@/src/components/ui/button";

export default function TestDbPage() {
    const user = useAuthStore((state) => state.user);
    const [result, setResult] = useState<string>("");

    const testConnection = async () => {
        setResult("Testing...");
        
        try {
            console.log("=== DB Connection Test ===");
            console.log("User:", user);
            console.log("User ID:", user?.id);
            
            // 1. 현재 세션 확인
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            console.log("Session:", sessionData);
            console.log("Session error:", sessionError);
            
            if (!user?.id) {
                setResult("❌ User not logged in. Please refresh the page.");
                return;
            }
            
            // 2. 간단한 INSERT 테스트
            const testSnippet = {
                user_id: user.id,
                title: "DB Test Snippet " + Date.now(),
                code: "console.log('test');",
                language: "javascript",
                is_favorite: false,
            };
            
            console.log("Inserting:", testSnippet);
            
            const { data, error } = await supabase
                .from("snippets")
                .insert(testSnippet)
                .select()
                .single();
            
            console.log("Insert result:", data);
            console.log("Insert error:", error);
            
            if (error) {
                setResult(`❌ Insert failed: ${error.message}\n\nDetails: ${JSON.stringify(error, null, 2)}`);
                return;
            }
            
            if (!data) {
                setResult("❌ No data returned from insert");
                return;
            }
            
            if (!data.id) {
                setResult(`❌ Snippet created but no ID!\n\nData: ${JSON.stringify(data, null, 2)}`);
                return;
            }
            
            // 3. ID 타입 및 형식 확인
            const id = data.id;
            const idType = typeof id;
            const idLength = id?.length;
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const isValidUuid = uuidRegex.test(id);
            
            console.log("ID:", id);
            console.log("ID type:", idType);
            console.log("ID length:", idLength);
            console.log("Is valid UUID:", isValidUuid);
            
            // 4. 생성된 스니펫 조회 테스트
            const { data: fetchData, error: fetchError } = await supabase
                .from("snippets")
                .select("*")
                .eq("id", id)
                .single();
            
            console.log("Fetch result:", fetchData);
            console.log("Fetch error:", fetchError);
            
            if (fetchError) {
                setResult(`⚠️ Created but can't fetch!\n\nID: ${id}\nFetch error: ${fetchError.message}`);
                return;
            }
            
            // 5. 테스트 스니펫 삭제
            await supabase.from("snippets").delete().eq("id", id);
            
            setResult(`✅ Success!\n\nCreated snippet:\nID: ${id}\nType: ${idType}\nLength: ${idLength}\nValid UUID: ${isValidUuid}\n\nAll tests passed!`);
            
        } catch (err) {
            console.error("Test error:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setResult(`❌ Exception: ${errorMessage}`);
        }
    };

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
            
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h2 className="font-semibold mb-2">Current User:</h2>
                <pre className="text-sm overflow-auto">
                    {JSON.stringify(user, null, 2)}
                </pre>
            </div>
            
            <Button onClick={testConnection} size="lg">
                Run Database Test
            </Button>
            
            {result && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                    <h2 className="font-semibold mb-2">Test Result:</h2>
                    <pre className="text-sm whitespace-pre-wrap overflow-auto">
                        {result}
                    </pre>
                </div>
            )}
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h2 className="font-semibold mb-2">Instructions:</h2>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Click &quot;Run Database Test&quot; button</li>
                    <li>Check the result above</li>
                    <li>Open browser console (F12) for detailed logs</li>
                    <li>Copy all console output and share if there are errors</li>
                </ol>
            </div>
        </div>
    );
}

