"use server"
import { fetchUserContribution, ContributionCalendar } from '@/module/github/lib/contributions';
import { getGithubToken } from '@/module/github/lib/tokens';

import { Octokit } from 'octokit';
import prisma from '@/lib/db';
import { requireSession } from '@/lib/server-action';

interface MonthlyData {
  [key: string]: { commits: number; prs: number; reviews: number };
}

type ContributionDay = {
  date: string;
  count: number;
  level: number;
};
export async function getContributionStats() {
    try {
        await requireSession()
        const token = await getGithubToken()
        const octokit = new Octokit({
            auth: token
        })
        const { data: user } = await octokit.rest.users.getAuthenticated()
        const username = user.login;
        const calendar = await fetchUserContribution(token, username)
        if (!calendar) {
            return null;
        }
        const contribution: ContributionDay[] = calendar.weeks.flatMap(
          (week) => week.contributionDays.map((day: { date: string; contributionCount: number }) => ({
            date: day.date,
            count: day.contributionCount,
            level: Math.min(4, Math.floor(day.contributionCount / 3)),
          }))
        )
        return {
            totalContributions: calendar.totalContributions,
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
        const session = await requireSession()
        const token = await getGithubToken()
        const octokit = new Octokit({
            auth: token
        })
        const {data :user} = await octokit.rest.users.getAuthenticated()
        
        const [totalRepos, totalReviews] = await Promise.all([
			prisma.repository.count({
				where: {
					userid: session.id,
				},
			}),
			prisma.review.count({
				where: {
					repository: {
						userid: session.id,
					},
				},
			}),
		]);
        //
        const calendarData = await fetchUserContribution(token,user.login)
        const totalCommits = calendarData?.totalContributions || 0

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
            totalCommits,
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
        const session = await requireSession()
        const token = await getGithubToken()
        const octokit = new Octokit({
            auth: token
        })
        const {data :user} = await octokit.rest.users.getAuthenticated()
        const calendar = await fetchUserContribution(token,user.login)
        if(!calendar){
            return [];
        }
        const monthlyData: MonthlyData = {};
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
        calendar.weeks.forEach((week) => {
            week.contributionDays.forEach((day) => {
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
                    userid: session.id,
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

        prs.items.forEach((pr: { created_at: string }) => {
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

   

