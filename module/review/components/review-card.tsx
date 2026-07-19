"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ReviewPreview } from "@/components/markdown-renderer";
import { ReviewDetailDialog } from "./review-detail-dialog";

interface ReviewCardProps {
	review: {
		id: string;
		prTitle: string;
		prNumber: number;
		prUrl: string;
		status: string;
		createdAt: Date | string;
		review: string;
		repository: {
			fullName: string;
		};
	};
}

export function ReviewCard({ review }: ReviewCardProps) {
	return (
		<Card className="hover:shadow-md transition-shadow duration-200 border-border/80">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="space-y-2 flex-1">
						<div className="flex items-center gap-2 flex-wrap">
							<CardTitle className="text-lg">
								{review.prTitle}
							</CardTitle>
							{review.status === "completed" && (
								<Badge
									variant="default"
									className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"
								>
									<CheckCircle2 className="h-3 w-3" />
									Completed
								</Badge>
							)}
							{review.status === "failed" && (
								<Badge
									variant="destructive"
									className="gap-1 bg-destructive/10 text-destructive border-destructive/20"
								>
									<XCircle className="h-3 w-3" />
									Failed
								</Badge>
							)}
							{review.status === "pending" && (
								<Badge
									variant="secondary"
									className="gap-1"
								>
									<Clock className="h-3 w-3" />
									Pending
								</Badge>
							)}
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						aria-label="View PR on GitHub"
						asChild
					>
						<a
							href={review.prUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							<ExternalLink className="h-4 w-4" />
						</a>
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="text-xs text-muted-foreground font-medium">
						{formatDistanceToNow(
							new Date(review.createdAt),
							{ addSuffix: true }
						)}
					</div>
					<ReviewPreview content={review.review} />

					<div className="flex gap-2">
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="default" size="sm">
									View Full Review
								</Button>
							</DialogTrigger>
							<ReviewDetailDialog review={review} />
						</Dialog>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
