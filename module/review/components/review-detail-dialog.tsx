"use client";

import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ReviewExportButton } from "./review-export-button";

interface ReviewDetailDialogProps {
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

export function ReviewDetailDialog({ review }: ReviewDetailDialogProps) {
	return (
		<DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-6">
			<DialogHeader className="border-b border-border pb-4">
				<div className="flex items-center gap-2 flex-wrap">
					<DialogTitle className="text-xl font-bold tracking-tight">
						{review.prTitle}
					</DialogTitle>
					{review.status === "completed" && (
						<Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
							Completed
						</Badge>
					)}
				</div>
				<DialogDescription className="text-xs">
					{review.repository.fullName} PR #{review.prNumber} {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
				</DialogDescription>
			</DialogHeader>

			<ScrollArea className="flex-1 pr-4 py-4 overflow-y-auto">
				<MarkdownRenderer content={review.review} />
			</ScrollArea>

			<div className="flex justify-end gap-2 border-t border-border pt-4 mt-2">
				<ReviewExportButton reviewId={review.id} />
				<Button variant="outline" size="sm" asChild>
					<a
						href={review.prUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="gap-1.5 flex items-center"
					>
						View on GitHub
						<ExternalLink className="h-3 w-3" />
					</a>
				</Button>
			</div>
		</DialogContent>
	);
}
