// src/components/editor/CodeEditor.tsx
"use client";

import { useRef } from "react";
import { useTheme } from "next-themes";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: string;
    height?: string;
    readOnly?: boolean;
}

export function CodeEditor({
    value,
    onChange,
    language,
    height = "400px",
    readOnly = false,
}: CodeEditorProps) {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const { theme } = useTheme();

    // 에디터가 마운트되면 실행
    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;

        // 에디터 옵션 설정
        editor.updateOptions({
            minimap: { enabled: false }, // 우측 미니맵 끄기
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: readOnly,
            automaticLayout: true, // 창 크기 변경 시 자동 조정
        });
    };

    // 테마에 따라 에디터 테마 변경
    const editorTheme = theme === "dark" ? "vs-dark" : "vs-light";

    return (
        <div className="border rounded-lg overflow-hidden dark:border-gray-700">
            <Editor
                height={height}
                language={language}
                value={value}
                onChange={(value) => onChange(value || "")}
                onMount={handleEditorDidMount}
                theme={editorTheme}
                options={{
                    padding: { top: 16, bottom: 16 },
                    scrollbar: {
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                    },
                }}
            />
        </div>
    );
}
