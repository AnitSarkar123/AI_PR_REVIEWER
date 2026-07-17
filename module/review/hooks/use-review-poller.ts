"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getPendingReviewCount } from "../actions/pending-count";

const POLL_INTERVAL = 5000;

export function useReviewPoller() {
	const queryClient = useQueryClient();
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const previousPendingRef = useRef<number>(0);

	const poll = useCallback(async () => {
		try {
			const pendingCount = await getPendingReviewCount();
			const prev = previousPendingRef.current;

			if (pendingCount < prev) {
				queryClient.invalidateQueries({ queryKey: ["reviews"] });
			}

			previousPendingRef.current = pendingCount;
		} catch {
			// Silently fail — polling should not disrupt the UI
		}
	}, [queryClient]);

	useEffect(() => {
		poll();
		intervalRef.current = setInterval(poll, POLL_INTERVAL);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [poll]);
}
