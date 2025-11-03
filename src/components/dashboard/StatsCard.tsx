// src/components/dashboard/StatsCard.tsx
"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    color?: "blue" | "green" | "purple" | "orange" | "pink";
}

const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
};

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    color = "blue",
}: StatsCardProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {value}
                    </p>
                    {description && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            {description}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
