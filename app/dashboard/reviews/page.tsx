"use client";

import * as React from "react";
import { useCallback } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	ExternalLink,
	Clock,
	CheckCircle2,
	XCircle,
	ChevronLeft,
	ChevronRight,
	GitPullRequest,
	Download,
} from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { getReviews, getReviewCount } from "@/module/review/actions";
import { MarkdownRenderer, ReviewPreview } from "@/components/markdown-renderer";

export default function ReviewsPageClient() {
	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["reviews"],
		queryFn: async ({ pageParam }) => {
			const result = await getReviews(pageParam as string | undefined);
			return result;
		},
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		initialPageParam: undefined as string | undefined,
	});

	const { data: totalCount } = useQuery({
		queryKey: ["review-count"],
		queryFn: async () => getReviewCount(),
		staleTime: 60_000,
	});

	const allReviews = data?.pages.flatMap((page) => page.data) || [];

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Review History
					</h1>
					<p className="text-muted-foreground">
						View all AI code reviews
					</p>
				</div>
				<div className="animate-pulse space-y-4">
					<div className="h-28 bg-muted rounded-xl" />
					<div className="h-28 bg-muted rounded-xl" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Review History
				</h1>
				<p className="text-muted-foreground">
					{totalCount !== undefined
						? `View all AI code reviews (${totalCount} total)`
						: "View all AI code reviews"}
				</p>
			</div>

			{allReviews.length === 0 ? (
				<Card>
					<CardContent className="pt-6">
						<div className="text-center py-12 space-y-4">
							<div className="flex justify-center">
								<GitPullRequest className="h-12 w-12 text-muted-foreground/40" />
							</div>
							<div>
								<p className="text-muted-foreground text-lg font-medium">
									No reviews yet
								</p>
								<p className="text-sm text-muted-foreground/70 mt-1">
									Connect a repository and open a pull request to get started.
								</p>
							</div>
							<Button asChild variant="default" size="sm">
								<Link href="/dashboard/repository">
									Connect a Repository
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			) : (
				<>
					<div className="grid gap-4">
						{allReviews.map((review: { id: string; prTitle: string; status: string; repository: { fullName: string }; prNumber: number; prUrl: string; createdAt: Date; review: string }) => (
							<Card
								key={review.id}
								className="hover:shadow-md transition-shadow duration-200 border-border/80"
							>
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
														<CheckCircle2 className="h-3 w-3" aria-hidden="true" />
														Completed
													</Badge>
												)}
												{review.status === "failed" && (
													<Badge
														variant="destructive"
														className="gap-1 bg-destructive/10 text-destructive border-destructive/20"
													>
														<XCircle className="h-3 w-3" aria-hidden="true" />
														Failed
													</Badge>
												)}
												{review.status === "pending" && (
													<Badge
														variant="secondary"
														className="gap-1"
													>
														<Clock className="h-3 w-3" aria-hidden="true" />
														Pending
													</Badge>
												)}
											</div>
											<CardDescription>
												{review.repository.fullName} PR #{review.prNumber}
											</CardDescription>
										</div>

										<Button
											variant="ghost"
											size="icon"
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
														<Button variant="outline" size="sm" onClick={() => {
															const blob = new Blob([review.review], { type: "text/markdown" });
															const url = URL.createObjectURL(blob);
															const a = document.createElement("a");
															a.href = url;
															a.download = `${review.repository.fullName}-PR${review.prNumber}-review.md`;
															a.click();
															URL.revokeObjectURL(url);
														}}>
															<Download className="h-3 w-3 mr-1.5" />
															Export
														</Button>
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
											</Dialog>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{hasNextPage && (
						<div className="flex justify-center pt-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => fetchNextPage()}
								disabled={isFetchingNextPage}
								className="gap-2"
							>
								{isFetchingNextPage ? (
									<>Loading...</>
								) : (
									<>
										<ChevronRight className="h-4 w-4" />
										Load More Reviews
									</>
								)}
							</Button>
						</div>
					)}

					{!hasNextPage && allReviews.length > 0 && (
						<p className="text-center text-sm text-muted-foreground pt-4">
							Showing all {totalCount ?? allReviews.length} reviews
						</p>
					)}
				</>
			)}
		</div>
	);
}