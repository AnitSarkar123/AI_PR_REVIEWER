
"use server"

import { inngest } from "@/inngest/client";
import prisma from "@/lib/db"
import { getPullRequestDiff } from "@/module/github/lib/github";
// import { success } from "better-auth";
import { canCreateReview, incrementReviewCount } from "@/module/payment/lib/subscription";

export async function reviewPullRequest(owner:string, repo:string, prNumber:number){
    try {
        console.log(`[PR REVIEW] Starting for ${owner}/${repo}#${prNumber}`);
        const repository =await prisma.repository.findFirst({
            where:{
                owner,
                name:repo
            },
            include:{
                user:{
                    include:{
                        accounts:{
                            where:{
                                providerId:"github"
                            }
                        }
                    }
                }
            }
    
        })
        if(!repository){
            console.error(`[PR REVIEW] Repository NOT found in DB: ${owner}/${repo}`);
            throw new Error(" Repository not found please try again later")
        }
        console.log(`[PR REVIEW] Repository found, proceeding with review`);
        const canReview = await canCreateReview(repository.user.id, repository.id)
        if (!canReview) {
            throw new Error("Review limit reached for this month please upgrade your subscription plan")
        }
        const githubAccount = repository?.user.accounts[0];
        if(!githubAccount?.accessToken){
        throw new Error(" Github account not found please try again later")
        }
        const token =githubAccount.accessToken;
        const {title }= await getPullRequestDiff(token, owner, repo, prNumber)
        await inngest.send({
            name:"pr.review.requested",
            data:{
                owner,
                repo,
                prNumber,
                userId: repository.user.id,
            }
    
        })
        await incrementReviewCount(repository.user.id, repository.id)
        return {
            success:true,
            message:`Pull request review requested for ${title}`
        }
    } catch (error) {
        try {
            const repository = await prisma.repository.findFirst({
                where:{
                    owner,
                    name:repo
                }
            })
            if(repository){
                await prisma.review.create({
                    data:{
                        repositoryId:repository.id,
                        prNumber,
                        prTitle:"Failed to fetch PR title",
                        prUrl:`https://github.com/${owner}/${repo}/pull/${prNumber}`,
                        review:`Error fetching PR details: ${error instanceof Error ? error.message : String(error)}`,
                        status:"failed"

                    }
                })
            }
        } catch (dbError) {
            console.error("Failed to log review failure in database", dbError)
            
        }
        
    }


}



