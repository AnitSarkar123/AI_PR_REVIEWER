"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getReviews(cursor?: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Unauthorized");
	}

	const reviews = await prisma.review.findMany({
		where: {
			repository: {
				userid: session.user.id,
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
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Unauthorized");
	}

	const count = await prisma.review.count({
		where: {
			repository: {
				userid: session.user.id,
			},
		},
	});

	return count;
}
