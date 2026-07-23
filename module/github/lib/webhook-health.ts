'use server';

import { Octokit } from 'octokit';
import { getGithubToken } from './tokens';

export interface WebhookStatus {
  exists: boolean;
  id: number | null;
  active: boolean;
  lastDelivery: string | null;
  lastResponse: number | null;
  events: string[];
  url: string | null;
}

export async function checkWebhookHealth(owner: string, repo: string): Promise<WebhookStatus> {
  try {
    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    const { data: hooks } = await octokit.rest.repos.listWebhooks({ owner, repo });
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

    const targetHook = hooks.find((h) => h.config?.url === webhookUrl);
    if (!targetHook) {
      return {
        exists: false,
        id: null,
        active: false,
        lastDelivery: null,
        lastResponse: null,
        events: [],
        url: null,
      };
    }

    let lastDelivery: string | null = null;
    let lastResponse: number | null = null;
    try {
      const { data: deliveries } = await octokit.rest.repos.listWebhookDeliveries({
        owner,
        repo,
        hook_id: targetHook.id,
        per_page: 1,
      });
      if (deliveries.length > 0) {
        lastDelivery = deliveries[0].delivered_at;
        lastResponse = deliveries[0].status_code;
      }
    } catch {
      // deliveries may not be available for all tokens
    }

    return {
      exists: true,
      id: targetHook.id,
      active: targetHook.active,
      lastDelivery,
      lastResponse,
      events: targetHook.events,
      url: webhookUrl,
    };
  } catch (error) {
    console.error(`[WebhookHealth] Error checking webhook for ${owner}/${repo}:`, error);
    return {
      exists: false,
      id: null,
      active: false,
      lastDelivery: null,
      lastResponse: null,
      events: [],
      url: null,
    };
  }
}
