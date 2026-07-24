'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';

import { useRepositories } from '@/module/repository/hooks/use-repositories';
import { RepositoryListSkeleton } from '@/module/repository/components/skeletons/list-skeleton';
import { useConnectRepository } from '@/module/repository/hooks/use-connect-repository';
import { RepositoryEmptyState } from '@/module/repository/components/repository-empty-state';
import { useDebounce } from '@/hooks/use-debounce';
import { RepositoryCard } from '@/module/repository/components/repository-card';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics?: string[];
  isConnected?: boolean;
}

const RepositoryPageClient = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useRepositories();

  const { mutate: connectRepo } = useConnectRepository();

  const [localConnectingId, setLocalConnectingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
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
        repo.name.toLowerCase().includes(trimmed) || repo.full_name.toLowerCase().includes(trimmed),
    );
  }, [allRepositories, debouncedSearch]);

  const handleConnect = (repo: Repository) => {
    setLocalConnectingId(repo.id);
    connectRepo(
      {
        owner: repo.full_name.split('/')[0],
        repo: repo.name,
        githubId: repo.id,
      },
      {
        onSettled: () => setLocalConnectingId(null),
      },
    );
  };

  const showLoading = isLoading && allRepositories.length === 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter">Repositories</h1>
        <p className="text-muted-foreground">Manage and view all your GitHub repositories</p>
      </div>

      <div className="relative">
        <Search
          className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <label htmlFor="repo-search" className="sr-only">
          Search repositories
        </label>
        <Input
          id="repo-search"
          placeholder="Search repositories..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {showLoading ? (
        <RepositoryListSkeleton />
      ) : isError ? (
        <RepositoryEmptyState type="loading-error" onRetry={() => refetch()} />
      ) : allRepositories.length === 0 && !debouncedSearch ? (
        <RepositoryEmptyState type="no-repositories" />
      ) : filteredRepositories.length === 0 ? (
        <RepositoryEmptyState type="no-results" searchQuery={debouncedSearch} />
      ) : (
        <>
          <div className="grid gap-4">
            {filteredRepositories.map((repo: any) => (
              <RepositoryCard
                key={repo.id}
                repo={repo}
                onConnect={handleConnect}
                isConnecting={localConnectingId === repo.id}
              />
            ))}
          </div>

          <div ref={observerTarget} className="py-4">
            {isFetchingNextPage && <RepositoryListSkeleton />}
            {!hasNextPage && allRepositories.length > 0 && (
              <p className="text-center text-muted-foreground">No more repositories</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RepositoryPageClient;
