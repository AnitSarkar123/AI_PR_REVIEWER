import prisma from "@/lib/db";
import { inngest } from "../client";
import { getPullRequestDiff, postReviewComment } from "@/module/github/lib/github";
import { retrieveContext } from "@/module/ai/lib/rag";
import { generateText } from "ai";
import { getAIModel } from "@/lib/ai";

export const generateReview = inngest.createFunction(
    { id: "generate-review", retries: 3 },
    { event: "pr.review.requested" },
    async ({ event, step }) => {
        try {
            const { owner, repo, prNumber, userId } = event.data

            const { diff, title, description, token } = await step.run("fetch-pr-data", async () => {
                const account = await prisma.account.findFirst({
                    where: {
                        userId: userId,
                        providerId: "github",
                    }
                })
                if (!account?.accessToken) {
                    throw new Error("No GitHub access token found for user. Please reconnect your GitHub account.")
                }
                if (account.accessTokenExpiresAt && new Date(account.accessTokenExpiresAt) < new Date()) {
                    throw new Error("GitHub access token has expired. Please re-authenticate.")
                }
                const data = await getPullRequestDiff(account.accessToken, owner, repo, prNumber)
                return { ...data, token: account.accessToken }
            })

            const repository = await step.run("fetch-repo", async () => {
                return await prisma.repository.findFirst({
                    where: { owner, name: repo }
                })
            })

            const context = await step.run("retrive-context",
                async () => {
                    const query = `${title}\n${description}`
                    return await retrieveContext(query, `${owner}/${repo}`)

                }
            )

            const review = await step.run("generate-ai-review", async () => {
                const prompt = `You are an expert code reviewer. Analyze the following pull request and provide a detailed, constructive code review.

            PR Title: ${title}
            PR Description: ${description || "No description provided"}

            Context from Codebase:
            ${context.join("\n\n")}

            Code Changes:
            \`\`\`diff
            ${diff}
            \`\`\`

            Please provide:
            1. **Walkthrough**: A file-by-file explanation of the   changes.
            2. **Sequence Diagram**: A Mermaid JS sequence diagram  visualizing the flow of the changes (if applicable). Use     \`\`\`mermaid ... \`\`\` block. 
            **STRICT MERMAID RULES**:
            - Start with \`sequenceDiagram\`.
            - **MUST** explicitly declare all participants at the top using \`participant Alias as Name\`.
            - **DO NOT** use special characters like parentheses \`()    \`, slashes \`/\`, dots \`.\`, brackets \`[]\`, or braces \`{}\` in participant names or message labels. Use only alphanumeric characters and spaces.
        - Example of a GOOD label: \`Process Payment Request\`
        - Example of a BAD label: \`processPayment(data)\`
        - Keep the diagram focused on the core logic changes.
        - If a diagram is not helpful for these changes, omit this section entirely.
            3. **Summary**: Brief overview.
            4. **Strengths**: What's done well.
            5. **Issues**: Bugs, security concerns, code smells.
            6. **Suggestions**: Specific code improvements.
            7. **Poem**: A short, creative poem summarizing the changes at the very end.

            Please provide your response in valid JSON format ONLY, without markdown wrapping:
            {
              "review": "Your detailed markdown review...",
              "score": 85
            }
            `;
                const text = await generateText({
                    model: getAIModel(repository?.preferredModel || "google"),
                    prompt,
                })
                try {
                    const cleanText = text.output.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
                    return JSON.parse(cleanText);
                } catch(e) {
                    return { review: text.output, score: null };
                }
            })
            await step.run("post-comment", async () => {
                await postReviewComment(token, owner, repo, prNumber, review.review)

            })
            await step.run("save-review", async () => {
                if (repository) {
                    await prisma.review.create({
                        data: {
                            repositoryId: repository.id,
                            prNumber,
                            prTitle: title,
                            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
                            review: review.review,
                            score: review.score,
                            status: "completed"
                        }
                    })



                }
            })
            
            await step.run("notify-slack", async () => {
                if (repository?.slackWebhookUrl) {
                    await fetch(repository.slackWebhookUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            text: `✅ PR Review Completed for ${owner}/${repo}#${prNumber}\n*Title*: ${title}\n*Score*: ${review.score}/100\n<https://github.com/${owner}/${repo}/pull/${prNumber}|View PR>`
                        })
                    })
                }
            })

            console.log("[INNGEST] Review completed successfully for:", owner, repo, prNumber)
            return {
                success: true

            }
        } catch (error) {
            console.error("[INNGEST] Error in generateReview function:", error)
            throw error;
        }
    }
)