"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Star, Search } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

import { useRepositories } from "@/module/repository/hooks/use-repositories";
import { RepositoryListSkeleton } from "@/module/repository/components/repository-skeleton";
import { useConnectRepository } from "@/module/repository/hooks/use-connect-repository";
import { RepositoryEmptyState } from "@/module/repository/components/repository-empty-state";
import { useDebounce } from "@/hooks/use-debounce";

interface Repository {
	id: number;
	name: string;
	full_name: string;
	description: string | null;
	html_url: string;
	stargazers_count: number;
	language: string | null;
	topics: string[];
	isConnected?: boolean;
}

const RepositoryPageClient = () => {
	const {
		data,
		isLoading,
		isError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
	} = useRepositories();

	const { mutate: connectRepo } = useConnectRepository();

	const [localConnectingId, setLocalConnectingId] = useState<number | null>(
		null
	);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 300);
	const observerTarget = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries: any) => {
				if (
					entries[0].isIntersecting &&
					hasNextPage &&
					!isFetchingNextPage
				) {
					fetchNextPage();
				}
			},
			{
				threshold: 0.1,
			}
		);

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const allRepositories = data?.pages.flatMap((page) => page) || [];

	const filteredRepositories = useMemo(() => {
		const trimmed = debouncedSearch.trim().toLowerCase();
		if (!trimmed) return allRepositories;
		return allRepositories.filter(
			(repo: Repository) =>
				repo.name.toLowerCase().includes(trimmed) ||
				repo.full_name.toLowerCase().includes(trimmed)
		);
	}, [allRepositories, debouncedSearch]);

	const handleConnect = (repo: Repository) => {
		setLocalConnectingId(repo.id);
		connectRepo(
			{
				owner: repo.full_name.split("/")[0],
				repo: repo.name,
				githubId: repo.id,
			},
			{
				onSettled: () => setLocalConnectingId(null),
			}
		);
	};

	const showLoading = isLoading && allRepositories.length === 0;

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

			<div className="relative">
				<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search repositories..."
					className="pl-8"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			{showLoading ? (
				<RepositoryListSkeleton />
			) : isError ? (
				<RepositoryEmptyState
					type="loading-error"
					onRetry={() => refetch()}
				/>
			) : allRepositories.length === 0 && !debouncedSearch ? (
				<RepositoryEmptyState type="no-repositories" />
			) : filteredRepositories.length === 0 ? (
				<RepositoryEmptyState
					type="no-results"
					searchQuery={debouncedSearch}
				/>
			) : (
				<>
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
				</>
			)}
		</div>
	);
};

export default RepositoryPageClient;
