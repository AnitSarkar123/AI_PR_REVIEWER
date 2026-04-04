"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Session, Repository } from '../../../lib/generated/prisma/browser';
import { success } from "better-auth"
import { deleteWebhook } from "@/module/github/lib/github"

export async function getUserProfile(){
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session) {
            throw new Error("Unauthorized")
        }
        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id
            },
            select:{
                id: true,
                name: true,
                email: true,
                image:true,
                createdAt:true
            }
        })
        return user
    } catch (error) {
        console.log("Error fetching user profile:", error)
        throw new Error("Failed to fetch user profile")
    }
}
export async function updateUserProfile(data:{
    name?: string;
    email?: string
}){
    try {
        const Session= await auth.api.getSession({
            headers: await headers()
        })
        if(!Session){
            throw new Error("Unauthorized")
        }
        const updatedUser = await prisma.user.update({
            where:{
                id: Session.user.id
            },
            data:{
                name: data.name || undefined,
                email: data.email || undefined
            },
            select:{
                id: true,
                name: true,
                email:true

            }
        })
        revalidatePath("/dashboard/settings","layout")
        return {
            success: true,
            user: updatedUser
        }

        
    } catch (error) {
        console.log("Error updating user profile:", error)
        return {
            success: false,
            user: null
        }
    }
}

export async function getConnectedRepositories(){
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }
        const repositories = await prisma.repository.findMany({
            where: {
                userid: session.user.id
            },
            select: {
                id: true,
                name: true,
                owner: true,
                fullName: true,
                url: true,
                createdAt: true
            },
            orderBy: {
                createdAt: "desc"
            }

        })
        return repositories
    } catch (error) {
        console.log("Error fetching connected repositories:", error)
        // throw new Error("Failed to fetch connected repositories")
        return []
        
    }
}
export async function disconnectRepository(repositoryId: string){
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }
        const repository= await prisma.repository.findFirst({
            where:{
                id: repositoryId,
                userid: session.user.id
            }
        })
        if (!repository) {
            throw new Error("Repository not found")
        }
        await deleteWebhook(repository.owner, repository.name)
        await prisma.repository.delete({
            where:{
                id: repositoryId,
                userid:session.user.id
            }
        })
        revalidatePath("/dashboard/settings","page")
        revalidatePath("/dashboard/repository","page")

        return {
            success: true
        }


    } catch (error) {
        console.log("Error disconnecting repository:", error)
        return {
            success: false,
            error: "Failed to disconnect repository"
        }
    }

}

export async function disconnectAllRepositories(){
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }
        const repository= await prisma.repository.findMany({
            where:{
                
                userid: session.user.id
            }
        })
        await Promise.all(repository.map(async(repo)=>{
            
            await deleteWebhook(repo.owner, repo.name)
        }))
        const result =await prisma.repository.deleteMany({
            where:{
                userid:session.user.id,
            }
        })
        revalidatePath("/dashboard/settings","page")
        revalidatePath("/dashboard/repository","page")
        return {
            success: true,
            deletedCount: result.count
        }

        
    } catch (error) {
        console.log("Error disconnecting all repositories:", error)
        return {
            success: false,
            deletedCount: 0,
            error:  "Failed to disconnect repositories"
        }
        
    }
}