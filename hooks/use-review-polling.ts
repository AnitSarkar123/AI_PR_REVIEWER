"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPendingReviewCount } from "@/module/review/actions";

const POLL_INTERVAL_MS = 10_000;

export function useReviewPolling() {
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: pendingCount } = useQuery({
    queryKey: ["pending-review-count"],
    queryFn: getPendingReviewCount,
    refetchInterval: POLL_INTERVAL_MS,
    staleTime: 5_000,
  });

  useEffect(() => {
    if (pendingCount && pendingCount > 0) {
      intervalRef.current = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["reviews"] });
        queryClient.invalidateQueries({ queryKey: ["review-count"] });
        queryClient.invalidateQueries({ queryKey: ["pending-review-count"] });
      }, POLL_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pendingCount, queryClient]);

  return { pendingCount: pendingCount || 0 };
}