// app/global-error.tsx
"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Critical global error:", error);
    }, [error]);

    return (
        <html>
            <body>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "100vh",
                        padding: "20px",
                        fontFamily: "system-ui, sans-serif",
                        backgroundColor: "#f9fafb",
                    }}
                >
                    <div
                        style={{
                            width: "64px",
                            height: "64px",
                            backgroundColor: "#fee2e2",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "24px",
                        }}
                    >
                        <span style={{ fontSize: "32px" }}>⚠️</span>
                    </div>

                    <h1
                        style={{
                            fontSize: "24px",
                            marginBottom: "16px",
                            fontWeight: "bold",
                            color: "#111827",
                        }}
                    >
                        Critical Error
                    </h1>

                    <p
                        style={{
                            color: "#6b7280",
                            marginBottom: "24px",
                            textAlign: "center",
                            maxWidth: "400px",
                        }}
                    >
                        A critical error occurred. Please refresh the page or
                        contact support if the problem persists.
                    </p>

                    <button
                        onClick={reset}
                        style={{
                            padding: "12px 24px",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: "500",
                        }}
                    >
                        Refresh Page
                    </button>

                    {process.env.NODE_ENV === "development" && (
                        <div
                            style={{
                                marginTop: "32px",
                                padding: "16px",
                                backgroundColor: "#f3f4f6",
                                borderRadius: "8px",
                                maxWidth: "600px",
                                width: "100%",
                            }}
                        >
                            <p
                                style={{
                                    fontSize: "12px",
                                    fontFamily: "monospace",
                                    color: "#dc2626",
                                    margin: 0,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                }}
                            >
                                {error.message}
                            </p>
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
