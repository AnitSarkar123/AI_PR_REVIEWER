'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';

interface Feature {
  name: string;
  included: boolean;
}

interface SubscriptionCardProps {
  title: string;
  description: string;
  price: string;
  features: Feature[];
  isCurrent: boolean;
  onAction?: () => void;
  actionLabel: string;
  actionDisabled?: boolean;
  actionLoading?: boolean;
}

export function SubscriptionCard({
  title,
  description,
  price,
  features,
  isCurrent,
  onAction,
  actionLabel,
  actionDisabled,
  actionLoading,
}: SubscriptionCardProps) {
  return (
    <Card className={isCurrent ? 'ring-2 ring-primary' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {isCurrent && <Badge className="ml-2">Current Plan</Badge>}
        </div>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {features.map((feature) => (
            <div key={feature.name} className="flex items-center gap-2">
              {feature.included ? (
                <Check className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className={feature.included ? '' : 'text-muted-foreground text-sm'}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>
        <Button
          className="w-full"
          variant={isCurrent ? 'outline' : 'default'}
          onClick={onAction}
          disabled={actionDisabled || actionLoading}
        >
          {actionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            actionLabel
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
