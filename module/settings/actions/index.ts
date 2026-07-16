"use server"

import prisma from "@/lib/db"
import { requireSession } from "@/lib/server-action"
import { revalidatePath } from "next/cache"

import { deleteWebhook } from "@/module/github/lib/github"
import { decrementRepositoryCount, resetRepositoryCount } from "@/module/payment/lib/subscription"

export async function getUserProfile(){
    try {
        const session = await requireSession()
        const user = await prisma.user.findUnique({
            where: {
                id: session.id
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
        console.error("Error fetching user profile:", error)
        throw new Error("Failed to fetch user profile")
    }
}
export async function updateUserProfile(data: {
    name?: string;
    email?: string;
}) {
    try {
        const session = await requireSession();
        const updatedUser = await prisma.user.update({
            where: { id: session.id },
            data: {
                name: data.name || undefined,
                email: data.email || undefined
            },
            select: { id: true, name: true, email: true }
        });
        revalidatePath("/dashboard/settings", "layout");
        return {
            success: true,
            user: updatedUser
        };
    } catch (error) {
        console.error("Error updating user profile:", error)
        return {
            success: false,
            user: null,
            error: error instanceof Error ? error.message : "Failed to update profile"
        };
    }
}

export async function getConnectedRepositories(){
    try {
        const session = await requireSession()
        const repositories = await prisma.repository.findMany({
            where: {
                userid: session.id
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
        const session = await requireSession()
        const repository= await prisma.repository.findFirst({
            where:{
                id: repositoryId,
                userid: session.id
            }
        })
        if (!repository) {
            throw new Error("Repository not found")
        }
        await deleteWebhook(repository.owner, repository.name)
        await prisma.repository.delete({
            where:{
                id: repositoryId,
            }
        })
        await decrementRepositoryCount(session.id)
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
        const session = await requireSession()
        const repository= await prisma.repository.findMany({
            where:{
                
                userid: session.id
            }
        })
        await Promise.all(repository.map(async(repo)=>{
            
            await deleteWebhook(repo.owner, repo.name)
        }))
        const result =await prisma.repository.deleteMany({
            where:{
                userid:session.id,
            }
        })
        await resetRepositoryCount(session.id)
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