"use client"
import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchRepositories } from "../actions"

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

export const useRepositories = () => {
    return useInfiniteQuery<Repository[], Error>({
        queryKey: ["repositories"],
        queryFn: async ({ pageParam = 1 }) => {
            const data = await fetchRepositories(pageParam as number, 10)
            return data
        },
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 10) {
                return undefined
            }
            return allPages.length + 1
        },
        initialPageParam: 1,
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    })
}