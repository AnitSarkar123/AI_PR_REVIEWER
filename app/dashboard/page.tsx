"use client"
import React from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  GitCommit,
  GitPullRequest,
  MessageSquare,
  GitBranch,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

import { getDashboardStatus, getMonthlyActivity } from "@/module/dashboard/actions";
import ContributionGraph from '../../module/dashboard/components/contribution-graph';
import { RecentActivityCard } from '@/module/dashboard/components/recent-activity-card';


const Mainpage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => getDashboardStatus(),
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false

  })
  const { data: monthlyActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["monthly-activity"],
    queryFn: async () => getMonthlyActivity(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground'>Overview of your github activity and ai reviews</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 my-6">
          <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-border/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Repositories
              </CardTitle>
              <GitBranch className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mt-1">
                {isLoading ? (
                  <Skeleton className="h-8 w-20 bg-muted/65" />
                ) : (
                  stats?.totalRepos || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Connected Repositories
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-border/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Commits
              </CardTitle>
              <GitCommit className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mt-1">
                {isLoading ? (
                  <Skeleton className="h-8 w-20 bg-muted/65" />
                ) : (
                  (stats?.TotalCommits || 0).toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                In the last year
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-border/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pull Requests
              </CardTitle>
              <GitPullRequest className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mt-1">
                {isLoading ? (
                  <Skeleton className="h-8 w-20 bg-muted/65" />
                ) : (
                  stats?.totalPRs || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All Time
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-border/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                AI Reviews
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mt-1">
                {isLoading ? (
                  <Skeleton className="h-8 w-20 bg-muted/65" />
                ) : (
                  stats?.totalReviews || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Generated Reviews
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Contribution Activity</CardTitle>
          <CardDescription>
            Visualizing your coding frequency over the last year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContributionGraph />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>
              Monthly breakdown of commits, PRs and reviews (last
              6 months)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="h-80 w-full flex items-center justify-center">
                <div className="space-y-3 w-full px-8">
                  <div className="flex justify-between">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className="h-24 w-10 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                        <div className="h-3 w-8 bg-muted rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer
                  width={"100%"}
                  height={"100%"}
                >
                  <BarChart data={monthlyActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          "var(--background)",
                        borderColor: "var(--border)",
                      }}
                      itemStyle={{
                        color: "var(--foreground)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="commits"
                      name="Commits"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="prs"
                      name="Pull Requests"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="reviews"
                      name="AI Reviews"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <RecentActivityCard />

      </div>
    </div>

  )
}

export default Mainpage
