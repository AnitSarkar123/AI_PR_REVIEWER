// src/inngest/functions.ts
// import { inngest } from "./client";
import prisma from '@/lib/db';
import { inngest } from '../../inngest/client';
import { getRepoFileContents } from '@/module/github/lib/github';
import { indexCodebase } from '@/module/ai/lib/rag';
import { success } from 'better-auth';



export const indexRepo = inngest.createFunction(
  { id: "index-repo", triggers: { event: "repository.connected" } },

  async ({ event, step }) => {
    console.log("Indexing repository for RAG:", event.data)
    // Perform the indexing logic here, e.g., fetch repository data, process it, and store it in a vector database for RAG.
    const { owner, repo, userId } = event.data
    console.log(`Indexing repository ${owner}/${repo} for user ${userId}`)
    const files = await step.run("fetch-repo-files", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId: userId,
          providerId: "github",
        }
      })
      if (!account?.accessToken) {
        throw new Error("No access token found for user")
      }
      return await getRepoFileContents(account.accessToken, owner, repo)

    })
    await step.run("index-codebase", async () => {
      await indexCodebase(`${owner}-${repo}`, files)


    })
    return { success: true, indexedFiles: files.length }

  }
)