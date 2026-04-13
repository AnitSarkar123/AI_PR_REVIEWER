// src/inngest/functions.ts
// import { inngest } from "./client";
import prisma from '@/lib/db';
import { inngest } from '../../inngest/client';
import { getRepoFileContents } from '@/module/github/lib/github';
import { indexCodebase } from '@/module/ai/lib/rag';



export const indexRepo = inngest.createFunction(
  { id: "index-repo", triggers: { event: "repository.connected" } },

  async ({ event, step }) => {
    console.log("Indexing repository for RAG:", event.data)
    const { owner, repo, userId } = event.data
    console.log(`Indexing repository ${owner}/${repo} for user ${userId}`)

    const indexedFiles = await step.run("fetch-and-index-repo", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId: userId,
          providerId: "github",
        }
      })
      if (!account?.accessToken) {
        throw new Error("No access token found for user")
      }
      const files = await getRepoFileContents(account.accessToken, owner, repo)
      await indexCodebase(`${owner}/${repo}`, files)
      return files.length
    })

    return { success: true, indexedFiles }

  }
)