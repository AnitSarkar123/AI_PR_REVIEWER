'use client';

import { ActivityCalendar } from 'react-activity-calendar';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, GitCommit } from 'lucide-react';
import { useState, useEffect } from 'react';

import { getContributionStats } from '../../actions';
import { CalendarLegend } from './calendar-legend';

export function ContributionCalendarView() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['contribution-calendar'],
    queryFn: () => getContributionStats(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const blockTheme = mounted && theme === 'dark' ? 'dark' : 'light';

  if (isLoading) {
    return (
      <div className="h-[180px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading activity...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-[180px] flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">Failed to load contribution activity</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded hover:bg-accent transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      </div>
    );
  }

  const totalContributions = data?.total || 0;
  const calendarData = data?.calendar || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommit className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {totalContributions.toLocaleString()} contributions in the last year
          </span>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          title="Refresh calendar"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex justify-center border border-border/40 p-4 rounded-lg bg-card/50 overflow-x-auto">
        {mounted ? (
          <ActivityCalendar
            data={calendarData}
            theme={{
              light: [
                'var(--muted)',
                'rgba(59, 130, 246, 0.15)',
                'rgba(59, 130, 246, 0.4)',
                'rgba(59, 130, 246, 0.7)',
                'var(--primary)',
              ],
              dark: [
                'rgba(255,255,255,0.05)',
                'rgba(59, 130, 246, 0.2)',
                'rgba(59, 130, 246, 0.45)',
                'rgba(59, 130, 246, 0.75)',
                'var(--primary)',
              ],
            }}
            colorScheme={blockTheme}
            showColorLegend={false}
            showTotalCount={false}
          />
        ) : (
          <div className="h-[120px] w-full bg-muted/20 animate-pulse rounded" />
        )}
      </div>

      <CalendarLegend />
    </div>
  );
}
