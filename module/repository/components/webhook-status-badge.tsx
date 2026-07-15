"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw } from "lucide-react";

interface WebhookStatusBadgeProps {
  owner: string;
  repo: string;
}

async function fetchWebhookStatus(owner: string, repo: string) {
  const { checkWebhookHealth } = await import("@/module/github/lib/webhook-health");
  return checkWebhookHealth(owner, repo);
}

export function WebhookStatusBadge({ owner, repo }: WebhookStatusBadgeProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["webhook-health", owner, repo],
    queryFn: () => fetchWebhookStatus(owner, repo),
    staleTime: 60_000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1 text-xs">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking...
      </Badge>
    );
  }

  if (isError || !data) {
    return (
      <Badge variant="outline" className="gap-1 text-xs bg-destructive/5 text-destructive border-destructive/20">
        <XCircle className="h-3 w-3" />
        Error
      </Badge>
    );
  }

  if (!data.exists) {
    return (
      <Badge variant="outline" className="gap-1 text-xs bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20">
        <AlertTriangle className="h-3 w-3" />
        No Webhook
      </Badge>
    );
  }

  if (!data.active) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="gap-1 text-xs bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/20">
              <XCircle className="h-3 w-3" />
              Inactive
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Webhook exists but is inactive. Reconnect the repository to fix.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const wasSuccessful = data.lastResponse && data.lastResponse >= 200 && data.lastResponse < 300;
  const statusIcon = wasSuccessful ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <AlertTriangle className="h-3 w-3 text-amber-500" />;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className="gap-1 text-xs bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 cursor-help">
            {statusIcon}
            Active
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="text-xs space-y-1">
          <p>Last delivery: {data.lastDelivery ? new Date(data.lastDelivery).toLocaleString() : "N/A"}</p>
          {data.lastResponse && <p>Response: HTTP {data.lastResponse}</p>}
          <p>Events: {data.events.join(", ")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}