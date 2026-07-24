'use client';

import { useEffect, useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getPendingReviewCount } from '../actions/pending-count';

export function PendingReviewsBadge() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchCount = async () => {
      try {
        const count = await getPendingReviewCount();
        if (mounted) {
          setPendingCount(count);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="sr-only">Loading pending count</span>
      </Badge>
    );
  }

  if (pendingCount === null || pendingCount === 0) return null;

  return (
    <Badge variant="secondary" className="gap-1 animate-in fade-in">
      <Clock className="h-3 w-3" />
      <span>{pendingCount} pending</span>
    </Badge>
  );
}
