"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type RecentActivityItem = {
    id: string;
    type: "review" | "repository" | "pr";
    title: string;
    description: string;
    url: string | null;
    createdAt: Date;
};

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return [];
    }

    const [recentReviews, recentRepos] = await Promise.all([
        prisma.review.findMany({
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
            take: 5,
        }),
        prisma.repository.findMany({
            where: {
                userid: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 3,
        }),
    ]);

    const activities: RecentActivityItem[] = [];

    for (const review of recentReviews) {
        activities.push({
            id: `review-${review.id}`,
            type: "review",
            title: `AI Review: ${review.prTitle}`,
            description: `${review.repository.fullName} PR #${review.prNumber} — ${review.status}`,
            url: review.prUrl,
            createdAt: review.createdAt,
        });
    }

    for (const repo of recentRepos) {
        activities.push({
            id: `repo-${repo.id}`,
            type: "repository",
            title: `Connected ${repo.fullName}`,
            description: `${repo.owner}/${repo.name}`,
            url: repo.url,
            createdAt: repo.createdAt,
        });
    }

    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return activities.slice(0, 10);
}
