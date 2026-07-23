'use client';

import { WebhookActivityCard } from '@/module/webhook/components/webhook-activity-card';

export default function WebhooksPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Webhook Monitor</h1>
        <p className="text-muted-foreground">
          Monitor incoming GitHub webhook events and review processing status
        </p>
      </div>

      <div className="grid gap-6">
        <WebhookActivityCard />
      </div>
    </div>
  );
}
