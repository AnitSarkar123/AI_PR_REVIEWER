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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	ExternalLink,
	Activity,
	CheckCircle2,
	XCircle,
	Clock,
	RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { getWebhookActivity } from "../actions";

const statusIcon: Record<string, React.ReactNode> = {
	completed: <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
	failed: <XCircle className="h-3 w-3 text-destructive" />,
	pending: <Clock className="h-3 w-3 text-amber-500" />,
};

const statusBadge: Record<
	string,
	{ variant: "default" | "destructive" | "secondary"; label: string }
> = {
	completed: { variant: "default", label: "Completed" },
	failed: { variant: "destructive", label: "Failed" },
	pending: { variant: "secondary", label: "Pending" },
};

export function WebhookActivityCard() {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["webhook-activity"],
		queryFn: getWebhookActivity,
		refetchInterval: 30000,
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<div className="h-5 w-32 bg-muted rounded animate-pulse" />
					<div className="h-4 w-48 bg-muted rounded animate-pulse" />
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className="h-16 bg-muted rounded animate-pulse"
							/>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	const hasActivity = data && data.recentActivity.length > 0;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Activity className="h-5 w-5 text-muted-foreground" />
						<div>
							<CardTitle>Webhook Activity</CardTitle>
							<CardDescription>
								Recent GitHub webhook events and review statuses
							</CardDescription>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => refetch()}
					>
						<RefreshCw className="h-4 w-4" />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{!hasActivity ? (
					<div className="text-center py-8 text-muted-foreground">
						<p className="text-sm">
							No webhook events yet. Connect a repository to get
							started.
						</p>
					</div>
				) : (
					<ScrollArea className="max-h-[400px]">
						<div className="space-y-2">
							{data.recentActivity.map((event) => {
								const badge = statusBadge[event.status] || {
									variant: "secondary" as const,
									label: event.status,
								};
								return (
									<div
										key={event.id}
										className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
									>
										<div className="shrink-0">
											{statusIcon[event.status] || (
												<Activity className="h-3 w-3" />
											)}
										</div>

										<div className="flex-1 min-w-0 space-y-0.5">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium truncate">
													{event.repository}
												</span>
												{event.prNumber && (
													<span className="text-xs text-muted-foreground shrink-0">
														PR #{event.prNumber}
													</span>
												)}
											</div>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<span>{event.event}</span>
												<span>·</span>
												<span>
													{formatDistanceToNow(
														new Date(event.timestamp),
														{ addSuffix: true }
													)}
												</span>
											</div>
										</div>

										<Badge
											variant={badge.variant}
											className="shrink-0 text-[10px] px-2 py-0.5"
										>
											{badge.label}
										</Badge>
									</div>
								);
							})}
						</div>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	);
}
