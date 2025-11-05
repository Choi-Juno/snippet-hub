// app/(app)/dashboard/snippets/[id]/loading.tsx
import { Skeleton } from "@/src/components/ui/skeleton";
import { Card } from "@/src/components/ui/card";

export default function SnippetDetailLoading() {
    return (
        <div className="max-w-5xl">
            {/* 헤더 */}
            <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-10 w-24" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>

            {/* 제목 */}
            <div className="mb-6">
                <Skeleton className="h-9 w-64 mb-3" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                </div>
            </div>

            {/* 태그 */}
            <div className="mb-6">
                <Skeleton className="h-4 w-16 mb-2" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
            </div>

            {/* 설명 */}
            <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/10">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </Card>

            {/* 코드 에디터 */}
            <div className="mb-6">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-96 w-full rounded-lg" />
            </div>
        </div>
    );
}
