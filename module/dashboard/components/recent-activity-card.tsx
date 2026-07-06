"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, GitBranch, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { getRecentActivity, RecentActivityItem } from "../actions/recent-activity";

function ActivityIcon({ type }: { type: RecentActivityItem["type"] }) {
    switch (type) {
        case "review":
            return <MessageSquare className="h-4 w-4 text-emerald-500" />;
        case "repository":
            return <GitBranch className="h-4 w-4 text-blue-500" />;
        default:
            return <ExternalLink className="h-4 w-4 text-muted-foreground" />;
    }
}

function ActivityBadge({ type }: { type: RecentActivityItem["type"] }) {
    switch (type) {
        case "review":
            return <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Review</Badge>;
        case "repository":
            return <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20">Repository</Badge>;
        case "pr":
            return <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">PR</Badge>;
    }
}

export function RecentActivityCard() {
    const { data: activities, isLoading, isError, refetch } = useQuery({
        queryKey: ["recent-activity"],
        queryFn: async () => getRecentActivity(),
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest reviews and connections
                        </CardDescription>
                    </div>
                    {isError && (
                        <Button variant="ghost" size="icon" onClick={() => refetch()} className="h-8 w-8">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="animate-pulse flex items-start gap-3">
                                <div className="h-8 w-8 bg-muted rounded-full shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-4 bg-muted rounded w-3/4" />
                                    <div className="h-3 bg-muted rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !activities || activities.length === 0 ? (
                    <div className="text-center py-6">
                        <RefreshCw className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Connect a repository to get started
                        </p>
                        <Button variant="outline" size="sm" className="mt-3" asChild>
                            <Link href="/dashboard/repository">Browse Repositories</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="mt-0.5">
                                    <ActivityIcon type={activity.type} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium truncate">
                                            {activity.title}
                                        </span>
                                        <ActivityBadge type={activity.type} />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {activity.description}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                {activity.url && (
                                    <a
                                        href={activity.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-foreground mt-1"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
