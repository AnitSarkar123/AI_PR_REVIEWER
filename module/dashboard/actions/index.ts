"use server"
import { fetchUserContribution ,getGithubToken} from '@/module/github/lib/github';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Octokit } from 'octokit';
import prisma from '@/lib/db';
export async function getContributionStats() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized")
        }
        const token = await getGithubToken()
        const octokit = new Octokit({
            auth: token
        })
        const { data: user } = await octokit.rest.users.getAuthenticated()
        const username = user.login;
        const calender = await fetchUserContribution(token, username)
        if (!calender) {
            return null;
        }
        const contribution = calender.weeks.flatMap((week: any) => week.contributionDays.map((day: any) => ({
            date: day.date,
            count: day.contributionCount,
            level: Math.min(4, Math.floor(day.contributionCount / 3))


        }))
        )
        return {
            totalContributions: calender.totalContributions,
            contributions: contribution
        }
    }
    catch (error) {
        console.error("Error fetching contribution stats:", error);
        return null;
    }
}
export async function getDashboardStatus(){
    try{
        const session =await auth.api.getSession({
            headers: await headers()
        })
        if(!session?.user) {
            throw new Error("Unauthorized")
        }
        const token = await getGithubToken()
        const octokit = new Octokit({
            auth: token
        })
        const {data :user} = await octokit.rest.users.getAuthenticated()
        
        //TODO:fetch total connected repo from db
        // Get users github username
		// const { data: user } = await octokit.rest.users.getAuthenticated();

		const [totalRepos, totalReviews] = await Promise.all([
			prisma.repository.count({
				where: {
					userid: session.user.id,
				},
			}),
			// fetchUserContribution(token, user.login),
			// octokit.rest.search.issuesAndPullRequests({
			// 	q: `author:${user.login} type:pr`,
			// 	per_page: 1,
			// }),
			prisma.review.count({
				where: {
					repository: {
						userid: session.user.id,
					},
				},
			}),
		]);
        //
        const calender = await fetchUserContribution(token,user.login)
        const TotalCommits =calender?.totalContributions || 0

        //counting the the PRs from database or github
        const {data:prs} = await octokit.rest.search.issuesAndPullRequests({
            q:`author:${user.login} is:pr`,
            per_page:1
        })
        const totalPRs = prs.total_count

        //count ai reviews from database todo
        // const totalReviews = 44
        return{
            totalRepos,
            TotalCommits,
            totalPRs,
            totalReviews

        }
        
    
    }
    catch(error){
        console.error("Error fetching dashboard status:", error);
        return {
            totalRepos: 0,
            TotalCommits: 0,
            totalPRs: 0,
            totalReviews: 0
        }
    }
}

export async function getMonthlyActivity(){
    try{
        const session =await auth.api.getSession({
            headers: await headers()
        })
        if(!session?.user) {
            throw new Error("Unauthorized")
        }
        const token = await getGithubToken()
        const octokit = new Octokit({
            auth: token
        })
        const {data :user} = await octokit.rest.users.getAuthenticated()
        const calender = await fetchUserContribution(token,user.login)
        if(!calender){
            return [];
        }
        const monthlyData:{
            [key:string]:{commits:number,prs:number,reviews:number}
        }={}
        const monthNames =[
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ]
        const now = new Date();
		for (let i = 5; i >= 0; i--) {
			const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const monthKey = monthNames[date.getMonth()];
			monthlyData[monthKey] = {
				commits: 0,
				prs: 0,
				reviews: 0,
			};
		}
        calender.weeks.forEach((week:any)=>{
            week.contributionDays.forEach((day:any)=>{
                const date = new Date(day.date);
                const monthKey = monthNames[date.getMonth()];
                if(monthlyData[monthKey]){
                    monthlyData[monthKey].commits += day.contributionCount
                }
            })
        })
        //fetch reviews from database for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const reviews = await prisma.review.findMany({
            where: {
                repository: {
                    userid: session.user.id,
                },
                createdAt: {
                    gte: sixMonthsAgo,
                },
            },
            select: {
                createdAt: true,
            },
        });
        reviews.forEach((review) => {
            const monthKey = monthNames[review.createdAt.getMonth()];
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].reviews += 1;
            }
        })

        const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
            q: `author:${user.login} type:pr created:>${sixMonthsAgo.toISOString().split("T")[0]
                }`,
            per_page: 100,
        });

        prs.items.forEach((pr: any) => {
            const date = new Date(pr.created_at);
            const monthKey = monthNames[date.getMonth()];
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].prs += 1;
            }
        });

        return Object.keys(monthlyData).map((name) => ({
            name,
            ...monthlyData[name]
        }))
    }catch(error){
        console.error("Error fetching monthly activity:", error);
        return [];
    }
}

   

