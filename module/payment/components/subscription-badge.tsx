'use client';

import { Badge } from '@/components/ui/badge';

interface SubscriptionBadgeProps {
  tier: string;
}

export function SubscriptionBadge({ tier }: SubscriptionBadgeProps) {
  const isPro = tier.toUpperCase() === 'PRO';
  return (
    <Badge
      className={
        isPro
          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
          : 'bg-muted text-muted-foreground'
      }
    >
      {tier}
    </Badge>
  );
}
