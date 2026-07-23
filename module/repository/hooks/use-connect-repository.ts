'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// import { connectRepository } from "@/modules/dashboard/actions";
import { connectRepository } from '@/module/repository/actions';

export const useConnectRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      owner,
      repo,
      githubId,
    }: {
      owner: string;
      repo: string;
      githubId: number;
    }) => {
      return await connectRepository(owner, repo, githubId);
    },
    onSuccess: () => {
      toast.success('Repository connected successfully!');
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
      queryClient.invalidateQueries({
        queryKey: ['connected-repositories'],
      });
      queryClient.invalidateQueries({ queryKey: ['subscription-data'] });
    },
    onError: (error: Error) => {
      console.error('Failed to connect repository:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect repository';
      toast.error(errorMessage);
    },
  });
};
