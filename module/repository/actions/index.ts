"use server"
import prisma from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getRepositories } from "@/module/github/lib/github"

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
            isConnected: connectedRepoIds.has(repo.id)
        }
    })

}