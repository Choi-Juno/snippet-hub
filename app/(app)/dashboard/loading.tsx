// app/(app)/dashboard/loading.tsx
import { Skeleton } from "@/src/components/ui/skeleton";
import { Card } from "@/src/components/ui/card";

export default function DashboardLoading() {
    return (
        <div>
            {/* 헤더 Skeleton */}
            <div className="mb-8">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* 통계 카드 Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <Skeleton className="h-4 w-24 mb-3" />
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-12 w-12 rounded-lg" />
                        </div>
                    </Card>
                ))}
            </div>

            {/* 검색 & 필터 Skeleton */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-[120px]" />
            </div>

            {/* 스니펫 카드 Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <Skeleton className="h-6 w-32" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8 rounded" />
                                <Skeleton className="h-8 w-8 rounded" />
                                <Skeleton className="h-8 w-8 rounded" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-full mb-3" />
                        <div className="flex gap-2 mb-3">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-24 w-full rounded mb-3" />
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-20 rounded" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
