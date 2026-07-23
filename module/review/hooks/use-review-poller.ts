'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { getPendingReviewCount } from '../actions/pending-count';

const POLL_INTERVAL = 10000;

export function useReviewPoller() {
  const queryClient = useQueryClient();
  const previousPendingRef = useRef<number>(0);

  const { data: pendingCount } = useQuery({
    queryKey: ['pending-review-count'],
    queryFn: getPendingReviewCount,
    refetchInterval: POLL_INTERVAL,
    staleTime: 5000,
  });

  const poll = useCallback(async () => {
    try {
      const count = pendingCount ?? 0;
      const prev = previousPendingRef.current;

      if (count !== prev) {
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['webhook-activity'] });
      }

      previousPendingRef.current = count;
    } catch {
      // Silently fail — polling should not disrupt the UI
    }
  }, [pendingCount, queryClient]);

  useEffect(() => {
    poll();
  }, [poll]);

  return { pendingCount: pendingCount || 0 };
}
