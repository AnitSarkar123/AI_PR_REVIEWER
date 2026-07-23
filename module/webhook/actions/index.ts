'use server';

import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

interface WebhookActivityItem {
  id: string;
  event: string;
  repository: string;
  prNumber: number | null;
  status: string;
  timestamp: Date;
}

export async function getWebhookActivity(): Promise<{
  recentActivity: WebhookActivityItem[];
  totalEvents: number;
  lastEventAt: Date | null;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  const reviews = await prisma.review.findMany({
    where: {
      repository: {
        userid: session.user.id,
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
      createdAt: 'desc',
    },
    take: 20,
  });

  const activity: WebhookActivityItem[] = reviews.map((r) => ({
    id: r.id,
    event: 'pull_request',
    repository: r.repository.fullName,
    prNumber: r.prNumber,
    status: r.status,
    timestamp: r.createdAt,
  }));

  return {
    recentActivity: activity,
    totalEvents: activity.length,
    lastEventAt: activity.length > 0 ? activity[0].timestamp : null,
  };
}
