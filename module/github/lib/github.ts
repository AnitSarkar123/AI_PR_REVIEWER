import { Octokit } from 'octokit';

export const getGithubToken = async () => {
    const { getGithubToken: getGithubTokenFn } = await import('./token');
    return getGithubTokenFn();
};

export const fetchUserContribution = async (token: string, username: string) => {
    const { fetchUserContribution: fetchUserContributionFn } = await import('./contributions');
    return fetchUserContributionFn(token, username);
};

import { createWebhook as createWebhookFn } from './webhooks/create';
import { deleteWebhook as deleteWebhookFn } from './webhooks/delete';

export const createWebhook = async (owner: string, repo: string) => {
    return createWebhookFn(owner, repo);
};

export const deleteWebhook = async (owner: string, repo: string) => {
    return deleteWebhookFn(owner, repo);
};

export const getRepositories = async (page: number = 1, perPage: number = 10) => {
    const token = await getGithubToken()
    const octokit = new Octokit({
        auth: token
    })
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        direction: "desc",
        visibility: "all",
        per_page: perPage,
        page: page
    })
    return data
}

export async function getRepoFileContents(
    token: string,
    owner: string,
    repo: string,
    path: string = ""
): Promise<
    {
        path: string;
        content: string;
    }[]
> {
    const octokit = new Octokit({ auth: token });

    const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
    });

    if (!Array.isArray(data)) {
        if (data.type === "file" && data.content) {
            return [
                {
                    path: data.path,
                    content: Buffer.from(data.content, "base64").toString(
                        "utf-8"
                    ),
                },
            ];
        }
        return [];
    }

    let files: { path: string; content: string }[] = [];

    for (const item of data) {
        if (item.type === "file") {
            const { data: fileData } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: item.path,
            });

            if (
                !Array.isArray(fileData) &&
                fileData.type === "file" &&
                fileData.content
            ) {
                if (
                    !item.path.match(
                        /\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz)$/i
                    )
                ) {
                    files.push({
                        path: item.path,
                        content: Buffer.from(
                            fileData.content,
                            "base64"
                        ).toString("utf-8"),
                    });
                }
            }
        } else if (item.type === "dir") {
            const subFiles = await getRepoFileContents(
                token,
                owner,
                repo,
                item.path
            );

            files = files.concat(subFiles);
        }
    }

    return files;
}

export async function getPullRequestDiff(token: string, owner: string, repo: string, prNumber: number) {
    const octokit = new Octokit({ auth: token });
    const { data: pr } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
    });

    const { data: diff } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
        mediaType: {
            format: "diff"
        }
    })
    return {
        diff: diff as unknown as string,
        title: pr.title,
        description: pr.body || " ",
    }
}

export async function postReviewComment(
    token: string,
    owner: string,
    repo: string,
    prNumber: number,
    review: string
) {
    const octokit = new Octokit({ auth: token });
    await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: `##🤖 AI Code Review\n\n${review}\n\n --\n*Powered by AI PR Reviewer*`,
    })
}
