'use server';
import prisma from '@/lib/db';
import { requireSession } from '@/lib/server-action';
import { getRepositories, createWebhook } from '@/module/github/lib/github';
import { inngest } from '@/inngest/client';
import { canConnectRepository, incrementRepositoryCount } from '@/module/payment/lib/subscription';

interface RepositoryItem {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics?: string[];
  isConnected?: boolean;
}
export const fetchRepositories = async (page: number = 1, PerPage: number = 10) => {
  const session = await requireSession();
  const githubRepos = await getRepositories(page, PerPage);
  const dbRepos = await prisma.repository.findMany({
    where: {
      userid: session.id,
    },
  });
  const connectedRepoIds = new Set(dbRepos.map((repo) => repo.githubId));
  return githubRepos.map((repo: RepositoryItem) => {
    return {
      ...repo,
      isConnected: connectedRepoIds.has(String(repo.id)),
    };
  });
};

export const connectRepository = async (owner: string, repo: string, githubId: number | bigint) => {
  const session = await requireSession();
  //check user can connect more repositories
  const canConnect = await canConnectRepository(session.id);
  if (!canConnect) {
    throw new Error(
      'Repository connection limit reached for this plan please upgrade your subscription plan',
    );
  }
  const webhook = await createWebhook(owner, repo);
  if (webhook) {
    await prisma.repository.create({
      data: {
        githubId: String(githubId),
        name: repo,
        owner: owner,
        fullName: `${owner}/${repo}`,
        url: `https://github.com/${owner}/${repo}`,
        userid: session.id,
      },
    });

    //increase the connected repository count for the user
    await incrementRepositoryCount(session.id);

    //trigger reposetory indexing for rag
    try {
      await inngest.send({
        name: 'repository.connected',
        data: {
          owner,
          repo,
          userId: session.id,
        },
      });
    } catch (error) {
      console.error('Failed to send repository.connected event to Inngest', error);
    }
  }
  return webhook;
};
