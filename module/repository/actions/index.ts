"use server"
import prisma from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { createWebhook, getRepositories } from "@/module/github/lib/github"
import { inngest } from "@/inngest/client"
import { canConnectRepository, decrementRepositoryCount, incrementRepositoryCount } from "@/module/payment/lib/subscription"
export const fetchRepositories =async(page:number=1,PerPage:number=10)=>{
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if(!session){
        throw new Error("Unauthorized")
    }
    const githubRepos= await getRepositories(page, PerPage)
    const dbRepos = await prisma.repository.findMany({
        where:{
            userid:session.user.id
        }
    });
    const connectedRepoIds= new Set(dbRepos.map((repo=>repo.githubId)))
    return githubRepos.map((repo:any)=>{
        return {
            ...repo,
            isConnected: connectedRepoIds.has(String(repo.id))
        }
    })

}

export const connectRepository = async (owner: string, repo: string, githubId: number) => {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Unauthorized")
    }
    //check user can connect more repositories
    const canConnect = await canConnectRepository(session.user.id)
    if (!canConnect) {
        throw new Error("Repository connection limit reached for this plan please upgrade your subscription plan")
    }
    const webhook = await createWebhook(owner, repo)
    if (webhook) {
        await prisma.repository.create({
            data: {
                githubId: BigInt(githubId).toString(),
                name: repo,
                owner: owner,
                fullName: `${owner}/${repo}`,
                url: `https://github.com/${owner}/${repo}`,
                userid: session.user.id,
            }
        })

    //increase the connected repository count for the user
        await incrementRepositoryCount(session.user.id)



    //trigger reposetory indexing for rag
    try {
        await inngest.send({
            name: "repository.connected",
            data: {
                owner,
                repo,
                userId: session.user.id,
            }
        })

    } catch (error) {
        console.error("Failed to send repository.connected event to Inngest", error)

    }
    }
    return webhook
}   

