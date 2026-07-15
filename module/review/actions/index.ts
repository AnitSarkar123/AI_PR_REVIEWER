"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface ReviewFilters {
	status?: "pending" | "completed" | "failed" | "all";
	sortBy?: "newest" | "oldest";
	searchQuery?: string;
	page?: number;
	perPage?: number;
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	perPage: number;
	totalPages: number;
}

export async function getReviews(
	filters: ReviewFilters = {}
): Promise<PaginatedResult<any>> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Unauthorized");
	}

	const {
		status = "all",
		sortBy = "newest",
		searchQuery = "",
		page = 1,
		perPage = 10,
	} = filters;

	const where: any = {
		repository: {
			userid: session.user.id,
		},
	};

	if (status !== "all") {
		where.status = status;
	}

	if (searchQuery.trim()) {
		where.prTitle = {
			contains: searchQuery.trim(),
		};
	}

	const [total, reviews] = await Promise.all([
		prisma.review.count({ where }),
		prisma.review.findMany({
			where,
			include: {
				repository: true,
			},
			orderBy: {
				createdAt: sortBy === "oldest" ? "asc" : "desc",
			},
			skip: (page - 1) * perPage,
			take: perPage,
		}),
	]);

	return {
		data: reviews,
		total,
		page,
		perPage,
		totalPages: Math.ceil(total / perPage),
	};
}
