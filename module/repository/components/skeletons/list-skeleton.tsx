'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';

export function RepositoryListSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="animate-pulse border-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 bg-muted rounded" />
                <div className="h-4 w-72 bg-muted rounded" />
              </div>
              <div className="h-9 w-24 bg-muted rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="h-4 w-12 bg-muted rounded" />
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
