'use client';

interface UsageProgressCardProps {
  title: string;
  description?: string;
  value: number;
  limit: number | null;
  icon?: React.ReactNode;
}

export function UsageProgressCard({
  title,
  description,
  value,
  limit,
  icon,
}: UsageProgressCardProps) {
  const isUnlimited = limit === null;
  const percentage = isUnlimited ? 100 : Math.min((value / limit) * 100, 100);
  const isWarning = !isUnlimited && percentage >= 80;
  const isDanger = !isUnlimited && percentage >= 95;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
      {icon && <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-foreground truncate">{title}</h4>
        </div>

        {description && <p className="text-xs text-muted-foreground">{description}</p>}

        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            {!isUnlimited && (
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isDanger ? 'bg-destructive' : isWarning ? 'bg-amber-500' : 'bg-primary'
                }`}
                style={{ width: `${percentage}%` }}
              />
            )}
          </div>
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            {value} {isUnlimited ? '/ ∞' : `/ ${limit}`}
          </span>
        </div>
      </div>
    </div>
  );
}
