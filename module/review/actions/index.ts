"use server";

import prisma from "@/lib/db";
import { requireSession } from "@/lib/server-action";

export async function getReviews(cursor?: string) {
	const session = await requireSession();

	const reviews = await prisma.review.findMany({
		where: {
			repository: {
				userid: session.id,
			},
		},
		include: {
			repository: true,
		},
		orderBy: {
			createdAt: "desc",
		},
		take: 11,
		...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
	});

	const hasMore = reviews.length === 11;
	const data = hasMore ? reviews.slice(0, 10) : reviews;
	const nextCursor = hasMore ? data[data.length - 1]?.id : null;

	return { data, nextCursor, hasMore };
}

export async function getReviewCount() {
	const session = await requireSession();

	const count = await prisma.review.count({
		where: {
			repository: {
				userid: session.id,
			},
		},
	});

	return count;
}

export async function getPendingReviewCount() {
	let session;
	try {
		session = await requireSession();
	} catch {
		return 0;
	}

	const count = await prisma.review.count({
		where: {
			repository: {
				userid: session.id,
			},
			status: "pending",
		},
	});

	return count;
}

export async function retryFailedReview(reviewId: string) {
	const session = await requireSession();

	const review = await prisma.review.findUnique({
		where: { id: reviewId },
		include: { repository: true },
	});

	if (!review) {
		throw new Error("Review not found");
	}

	if (review.repository.userid !== session.id) {
		throw new Error("Unauthorized");
	}

	if (review.status !== "failed") {
		throw new Error("Only failed reviews can be retried");
	}

	const { reviewPullRequest } = await import("@/module/ai/actions");
	const result = await reviewPullRequest(
		review.repository.owner,
		review.repository.name,
		review.prNumber
	);

	return result;
}
