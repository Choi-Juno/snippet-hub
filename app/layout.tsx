import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/src/components/providers/AuthProvider";
import { ThemeProvider } from "@/src/components/providers/ThemeProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "SnippetHub - Code Snippet Management Platform",
        template: "%s | SnippetHub",
    },
    description:
        "A modern, feature-rich code snippet management platform. Organize, search, and manage your code snippets with syntax highlighting, tags, and dark mode support.",
    keywords: [
        "code snippets",
        "snippet manager",
        "code organization",
        "developer tools",
        "syntax highlighting",
        "code storage",
        "programming",
        "development",
    ],
    authors: [{ name: "SnippetHub" }],
    creator: "SnippetHub",
    publisher: "SnippetHub",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://snippethub.app",
        title: "SnippetHub - Code Snippet Management Platform",
        description:
            "Organize and manage your code snippets with powerful search, syntax highlighting, and tagging system.",
        siteName: "SnippetHub",
    },
    twitter: {
        card: "summary_large_image",
        title: "SnippetHub - Code Snippet Management Platform",
        description:
            "Organize and manage your code snippets with powerful search, syntax highlighting, and tagging system.",
        creator: "@snippethub",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        {children}
                        <Toaster position="top-right" richColors closeButton />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
