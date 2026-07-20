import { Octokit } from 'octokit';
import { getGithubToken } from '../tokens';

export const createWebhook = async (owner: string, repo: string) => {
    const token = await getGithubToken();
    const octokit = new Octokit({
        auth: token
    });
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;
    const { data: hooks } = await octokit.rest.repos.listWebhooks({
        owner,
        repo
    });
    const existingHook = hooks.find(hook => hook.config.url === webhookUrl);
    if (existingHook) {
        return existingHook;
    }
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "";
    const { data } = await octokit.rest.repos.createWebhook({
        owner,
        repo,
        config: {
            url: webhookUrl,
            content_type: "json",
            secret: webhookSecret || undefined,
        },
        events: ["pull_request"]
    });
    return data;
};
