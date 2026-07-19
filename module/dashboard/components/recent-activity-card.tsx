"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	MessageSquare,
	GitBranch,
	CheckCircle2,
	XCircle,
	Clock,
	Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { getRecentActivity, type ActivityItem } from "../actions/recent-activity";

/**
 * Configuration mapping activity types to corresponding icons and user-friendly labels.
 */
const typeConfig: Record<
	string,
	{ icon: React.ReactNode; label: string }
> = {
	review: {
		icon: <MessageSquare className="h-3.5 w-3.5 text-primary" />,
		label: "Review",
	},
	repository_connected: {
		icon: <GitBranch className="h-3.5 w-3.5 text-emerald-500" />,
		label: "Connected",
	},
	repository_disconnected: {
		icon: <GitBranch className="h-3.5 w-3.5 text-destructive" />,
		label: "Disconnected",
	},
};

function ActivityIcon({ item }: { item: ActivityItem }) {
	const base = typeConfig[item.type] || typeConfig.review;

	if (item.type === "review" && item.metadata.status === "failed") {
		return <XCircle className="h-3.5 w-3.5 text-destructive" />;
	}
	if (item.type === "review" && item.metadata.status === "pending") {
		return <Clock className="h-3.5 w-3.5 text-amber-500" />;
	}
	if (item.type === "review" && item.metadata.status === "completed") {
		return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
	}

	return base.icon;
}

export function RecentActivityCard() {
	const { data: activities, isLoading } = useQuery({
		queryKey: ["recent-activity"],
		queryFn: () => getRecentActivity(10),
		refetchInterval: 60000,
	});

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Activity className="h-5 w-5 text-muted-foreground" />
					<div>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>
							Your latest code reviews and repository actions
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								className="h-12 bg-muted rounded animate-pulse"
							/>
						))}
					</div>
				) : !activities || activities.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<p className="text-sm">No recent activity.</p>
						<p className="text-xs mt-1">
							Connect a repository to get started.
						</p>
					</div>
				) : (
					<ScrollArea className="max-h-[320px]">
						<div className="space-y-1">
							{activities.map((item) => (
								<div
									key={item.id}
									className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
								>
									<div className="shrink-0">
										<ActivityIcon item={item} />
									</div>

									<div className="flex-1 min-w-0">
										<p className="text-sm truncate">
											{item.description}
										</p>
										{item.metadata.repositoryName && (
											<p className="text-xs text-muted-foreground truncate">
												{item.metadata.repositoryName}
												{item.metadata.prNumber &&
													` · PR #${item.metadata.prNumber}`}
											</p>
										)}
									</div>

									<div className="shrink-0 text-xs text-muted-foreground">
										{formatDistanceToNow(
											new Date(item.timestamp),
											{ addSuffix: true }
										)}
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	);
}
