"use client";

import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { SearchX } from "lucide-react";
import { useReviews } from "@/module/review/hooks/use-reviews";
import { useReviewPoller } from "@/module/review/hooks/use-review-poller";
import { PendingReviewsBadge } from "@/module/review/components/pending-reviews-badge";
import { ReviewFilters, StatusFilter, SortOption } from "@/module/review/components/review-filters";
import { ReviewPagination } from "@/module/review/components/review-pagination";
import { ReviewCard } from "@/module/review/components/review-card";
import { ReviewFilters as Filters } from "@/module/review/actions";

export default function ReviewsPageClient() {
	const { pendingCount } = useReviewPoller();

	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [sortBy, setSortBy] = useState<SortOption>("newest");

	const filters: Filters = useMemo(() => ({
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

			<ReviewFilters
				searchQuery={searchQuery}
				onSearchChange={handleSearchChange}
				statusFilter={statusFilter}
				onStatusFilterChange={handleStatusFilterChange}
				sortBy={sortBy}
				onSortChange={handleSortChange}
				totalCount={totalCount}
			/>

			{reviews.length === 0 ? (
				<div className="text-center py-12 space-y-2 border border-dashed rounded-lg bg-card text-card-foreground">
					<SearchX className="h-8 w-8 mx-auto text-muted-foreground" />
					<p className="text-muted-foreground">
						{searchQuery || statusFilter !== "all"
							? "No reviews match your filters. Try adjusting your search."
							: "No reviews yet. Connect a repository and open a PR to get started."}
					</p>
				</div>
			) : (
				<div className="grid gap-4">
					{reviews.map((review: any) => (
						<ReviewCard key={review.id} review={review} />
					))}
				</div>
			)}

			{totalPages > 1 && (
				<ReviewPagination
					currentPage={page}
					totalPages={totalPages}
					onPageChange={setPage}
				/>
			)}
		</div>
	);
}