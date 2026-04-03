"use client"
import React, { useEffect } from 'react'

import { useRepositories } from '@/module/repository/hooks/use-repositories';
import { ExternalLink, Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RepositoryListSkeleton } from '@/module/repository/components/repository-skeleton';

interface Repository {
    id: number;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    stargazer_count: number;
    language: string;
    topic: string[];
    isConnected: boolean;
}
const RepositoryPage = () => {
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useRepositories()
    const [localConnectingId, setLocalConnectingId] = React.useState<number | null>(null)
    
    const [searchQuery, setSearchQuery] = React.useState('')
    const allRepositories = data?.pages.flatMap(page => page) || []
    const observerTarget = React.useRef<HTMLDivElement>(null)
    useEffect(()=>{
        const observer = new IntersectionObserver((entries)=>{
            if(entries[0].isIntersecting && hasNextPage && !isFetchingNextPage){
                fetchNextPage()
            }
        },{
            threshold:0.1
        }
        )
        const currentTarget = observerTarget.current
        if(currentTarget){
            observer.observe(currentTarget)
        }
        return()=>{
            if(currentTarget){
                observer.unobserve(currentTarget)
            }
        }
    },[hasNextPage,isFetchingNextPage,fetchNextPage])
    if (isLoading) {
		return (
			<div className="space-y-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tighter">
						Repositories
					</h1>
					<p className="text-muted-foreground">
						Manage and view all your GitHub repositories
					</p>
				</div>
				<RepositoryListSkeleton />
			</div>
		);
	}
    if (isError) {
		return (
			<div className="space-y-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tighter">
						Repositories
					</h1>
					<p className="text-muted-foreground">
						Manage and view all your GitHub repositories
					</p>
				</div>
				<p className="text-destructive text-center">
					Failed to load repositories
				</p>
			</div>
		);
	}
    const filteredRepositories = allRepositories.filter((repo: Repository) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.language?.toLowerCase().includes(searchQuery.toLowerCase()) 
    )
    const handleConnect = async (repo: any) => {


    }
        


    return (
        <div className='space-y-4'>
            <div>
                <h1 className="text-3xl font-bold tracking-tighter">
                    Repositories
                </h1>
                <p className="text-muted-foreground">
                    Manage and view all your GitHub repositories
                </p>
            </div>

            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search repositories..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="grid gap-4">
				{filteredRepositories.map((repo: any) => (
					<Card
						key={repo.id}
						className="hover:shadow-md transition-shadow"
					>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="space-y-2 flex-1">
									<div className="flex items-center gap-2">
										<CardTitle className="text-lg">
											{repo.name}
										</CardTitle>
										<Badge variant={"outline"}>
											{repo.language || "Unknown"}
										</Badge>
										{repo.isConnected && (
											<Badge variant={"secondary"}>
												Connected
											</Badge>
										)}
									</div>
									<CardDescription>
										{repo.description}
									</CardDescription>
								</div>
								<div className="flex gap-2">
									<Button variant="ghost" size="icon" asChild>
										<a
											href={repo.html_url}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink className="h-4 w-4" />
										</a>
									</Button>
									<Button
										onClick={() => handleConnect(repo)}
										disabled={
											localConnectingId === repo.id ||
											repo.isConnected
										}
										variant={
											repo.isConnected
												? "ghost"
												: "default"
										}
									>
										{localConnectingId === repo.id
											? "Connecting..."
											: repo.isConnected
											? "Connected"
											: "Connect"}
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-2">
								<div className="flex items-center gap-1">
									<Star
										className="h-4 w-4 text-primary"
										fill="#ffe0c2"
									/>
									<p>{repo.stargazers_count}</p>
								</div>
								{repo.topics.map((topic: string) => (
									<Badge key={topic} variant="outline">
										{topic}
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
            <div ref={observerTarget} className="py-4">
				{isFetchingNextPage && <RepositoryListSkeleton />}
				{!hasNextPage && allRepositories.length > 0 && (
					<p className="text-center text-muted-foreground">
						No more repositories
					</p>
				)}
			</div>

        </div>



    )
}

export default RepositoryPage
