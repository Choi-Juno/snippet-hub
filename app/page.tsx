import { Header } from "@/src/components/layout/Header";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { Search, Users, Zap, Code2 } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            <Header />

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-align">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Manage Your Code Snippets Like a Pro
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Save, organize, and share your code snippets with
                        powerful search and team collaboration.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/signup">
                            <Button size="lg" className="text-lg">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg"
                            >
                                View Demo
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-20">
                <h2 className="text-3xl font-bold text-center mb-12">
                    Why SnippetHub?
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard
                        icon={<Search className="w-8 h-8 text-blue-600" />}
                        title="Fast Search"
                        description="Find your snippets instantly with powerful full-text search"
                    />
                    <FeatureCard
                        icon={<Code2 className="w-8 h-8 text-purple-600" />}
                        title="50+ Languages"
                        description="Support for all major programming languages with syntax highlighting"
                    />
                    <FeatureCard
                        icon={<Users className="w-8 h-8 text-green-600" />}
                        title="Team Collaboration"
                        description="Share snippets with your team and collaborate in workspaces"
                    />
                    <FeatureCard
                        icon={<Zap className="w-8 h-8 text-orange-600" />}
                        title="Productivity Boost"
                        description="Access your snippets via browser, CLI, or IDE extensions"
                    />
                </div>
            </section>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}
