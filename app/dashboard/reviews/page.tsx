"use client";

import * as React from "react";
import { useState, useMemo, useCallback } from "react";
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
import { ExternalLink, Clock, CheckCircle2, XCircle, Clipboard, ClipboardCheck, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

import { getReviews } from "@/module/review/actions";
import { useReviewPoller } from "@/module/review/hooks/use-review-poller";
import { PendingReviewsBadge } from "@/module/review/components/pending-reviews-badge";

function parseInline(text: string) {
	const regex = /(\*\*.*?\*\*|`.*?`)/g;
	const parts = text.split(regex);
	return parts.map((part, index) => {
		if (part.startsWith("**") && part.endsWith("**")) {
			return (
				<strong key={index} className="font-semibold text-foreground">
					{part.slice(2, -2)}
				</strong>
			);
		}
		if (part.startsWith("`") && part.endsWith("`")) {
			return (
				<code
					key={index}
					className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-rose-600 dark:text-rose-400 font-medium"
				>
					{part.slice(1, -1)}
				</code>
			);
		}
		return part;
	});
}

function MarkdownRenderer({ content }: { content: string }) {
	const parts = content.split(/(```[\s\S]*?```)/g);

	return (
		<div className="space-y-4 text-sm leading-relaxed text-foreground/90">
			{parts.map((part, index) => {
				if (part.startsWith("```")) {
					const lines = part.split("\n");
					const language = lines[0].replace("```", "").trim();
					const code = lines.slice(1, -1).join("\n");
					return <CodeBlock key={index} language={language} code={code} />;
				}

				const lines = part.split("\n");
				return (
					<div key={index} className="space-y-2">
						{lines.map((line, lineIdx) => {
							const trimmed = line.trim();
							if (!trimmed) return <div key={lineIdx} className="h-2" />;

							if (trimmed.startsWith("### ")) {
								return (
									<h4
										key={lineIdx}
										className="text-base font-semibold mt-4 text-foreground tracking-tight"
									>
										{trimmed.slice(4)}
									</h4>
								);
							}
							if (trimmed.startsWith("## ")) {
								return (
									<h3
										key={lineIdx}
										className="text-lg font-bold mt-6 border-b border-border pb-1 text-foreground tracking-tight"
									>
										{trimmed.slice(3)}
									</h3>
								);
							}
							if (trimmed.startsWith("# ")) {
								return (
									<h2
										key={lineIdx}
										className="text-xl font-extrabold mt-8 text-foreground tracking-tight"
									>
										{trimmed.slice(2)}
									</h2>
								);
							}

							if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
								return (
									<ul key={lineIdx} className="list-disc pl-5 my-1 space-y-1">
										<li className="text-muted-foreground">
											<span className="text-foreground/90">{parseInline(trimmed.slice(2))}</span>
										</li>
									</ul>
								);
							}

							if (/^\d+\.\s/.test(trimmed)) {
								const match = trimmed.match(/^(\d+\.\s)(.*)/);
								return (
									<ol key={lineIdx} className="list-decimal pl-5 my-1 space-y-1">
										<li className="text-muted-foreground">
											<span className="text-foreground/90">
												{parseInline(match ? match[2] : trimmed)}
											</span>
										</li>
									</ol>
								);
							}

							return (
								<p key={lineIdx} className="my-2 text-foreground/80">
									{parseInline(line)}
								</p>
							);
						})}
					</div>
				);
			})}
		</div>
	);
}

function CodeBlock({ language, code }: { language: string; code: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="relative my-4 overflow-hidden rounded-lg border border-border bg-zinc-950 font-mono text-xs text-zinc-100 shadow-md">
			<div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2 text-zinc-400">
				<span className="font-semibold text-[10px] uppercase tracking-wider">{language || "code"}</span>
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
					onClick={handleCopy}
				>
					{copied ? (
						<ClipboardCheck className="h-3.5 w-3.5 text-emerald-400" />
					) : (
						<Clipboard className="h-3.5 w-3.5" />
					)}
				</Button>
			</div>
			<pre className="p-4 overflow-x-auto">
				<code className="text-zinc-300">{code}</code>
			</pre>
		</div>
	);
}

export default function ReviewsPageClient() {
	useReviewPoller();

	const { data: reviews, isLoading } = useQuery({
		queryKey: ["reviews"],
		queryFn: async ({ pageParam }) => {
			const result = await getReviews(pageParam as string | undefined);
			return result;
		},
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		initialPageParam: undefined as string | undefined,
	});

	const filters: ReviewFilters = useMemo(() => ({
		page,
		perPage: 10,
		searchQuery,
		status: statusFilter,
		sortBy,
	}), [page, searchQuery, statusFilter, sortBy]);

	const { data: result, isLoading } = useReviews(filters);

	const handleSearchChange = useCallback((value: string) => {
		setSearchQuery(value);
		setPage(1);
	}, []);

	const handleStatusFilterChange = useCallback((value: StatusFilter) => {
		setStatusFilter(value);
		setPage(1);
	}, []);

	const handleSortChange = useCallback((value: SortOption) => {
		setSortBy(value);
		setPage(1);
	}, []);

	const allReviews = data?.pages.flatMap((page) => page.data) || [];
	const { pendingCount } = useReviewPolling();

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Review History
						</h1>
						<p className="text-muted-foreground">
							View all AI code reviews
						</p>
					</div>
					<PendingReviewsBadge />
				</div>
				<div className="animate-pulse space-y-4">
					<div className="h-10 bg-muted rounded-lg" />
					<div className="h-28 bg-muted rounded-xl" />
					<div className="h-28 bg-muted rounded-xl" />
				</div>
			</div>
		);
	}

	const reviews = result?.data || [];
	const totalCount = result?.total || 0;
	const totalPages = result?.totalPages || 0;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Review History
					</h1>
					<p className="text-muted-foreground">
						View all AI code reviews
					</p>
				</div>
				<PendingReviewsBadge />
			</div>

			<ReviewFiltersComponent
				searchQuery={searchQuery}
				onSearchChange={handleSearchChange}
				statusFilter={statusFilter}
				onStatusFilterChange={handleStatusFilterChange}
				sortBy={sortBy}
				onSortChange={handleSortChange}
				totalCount={totalCount}
			/>

			{reviews.length === 0 ? (
				<Card>
					<CardContent className="pt-6">
						<div className="text-center py-12 space-y-2">
							<SearchX className="h-8 w-8 mx-auto text-muted-foreground" />
							<p className="text-muted-foreground">
								{searchQuery || statusFilter !== "all"
									? "No reviews match your filters. Try adjusting your search."
									: "No reviews yet. Connect a repository and open a PR to get started."}
							</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{reviews.map((review: any) => (
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
										</Dialog>
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

			<ReviewPagination
				currentPage={page}
				totalPages={totalPages}
				onPageChange={setPage}
			/>
		</div>
	);
}