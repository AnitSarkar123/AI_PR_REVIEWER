'use client';

import { useQuery } from '@tanstack/react-query';
import { getReviews, type ReviewFilters } from '../actions';

export function useReviews(filters: ReviewFilters = {}) {
  return useQuery({
    queryKey: ['reviews', filters],
    queryFn: async () => {
      return await getReviews(filters);
    },
  });
}
