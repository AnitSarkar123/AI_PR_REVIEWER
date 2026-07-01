"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getPendingReviewCount(): Promise<number> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return 0;
	}

	const count = await prisma.review.count({
		where: {
			repository: {
				userid: session.user.id,
			},
			status: "pending",
		},
	});

	return count;
}
