"use server";

import prisma from "@/lib/db";
import { requireSession } from "@/lib/server-action";

export type ActivityType = "review" | "repository_connected" | "repository_disconnected";

export interface ActivityItem {
	id: string;
	type: ActivityType;
	description: string;
	metadata: {
		repositoryName?: string;
		prNumber?: number;
		prTitle?: string;
		status?: string;
	};
	timestamp: Date;
}

export async function getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
	let session;
	try {
		session = await requireSession();
	} catch {
		return [];
	}

	const activities: ActivityItem[] = [];

	const reviews = await prisma.review.findMany({
		where: {
			repository: {
				userid: session.id,
			},
		},
		include: {
			repository: {
				select: {
					fullName: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		take: Math.ceil(limit * 0.7),
	});

	for (const review of reviews) {
		activities.push({
			id: `review-${review.id}`,
			type: "review",
			description: review.status === "failed"
				? `Review failed for PR #${review.prNumber}`
				: review.status === "pending"
				? `Review requested for PR #${review.prNumber}`
				: `Review completed for PR #${review.prNumber}`,
			metadata: {
				repositoryName: review.repository.fullName,
				prNumber: review.prNumber,
				prTitle: review.prTitle,
				status: review.status,
			},
			timestamp: review.createdAt,
		});
	}

	const repositories = await prisma.repository.findMany({
		where: {
			userid: session.id,
		},
		orderBy: {
			createdAt: "desc",
		},
		take: Math.ceil(limit * 0.3),
		select: {
			id: true,
			fullName: true,
			createdAt: true,
		},
	});

	for (const repo of repositories) {
		activities.push({
			id: `repo-${repo.id}`,
			type: "repository_connected",
			description: `Connected repository ${repo.fullName}`,
			metadata: {
				repositoryName: repo.fullName,
			},
			timestamp: repo.createdAt,
		});
	}

	activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

	return activities.slice(0, limit);
}
