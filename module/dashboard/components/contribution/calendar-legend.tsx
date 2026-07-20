"use client";

export function CalendarLegend() {
	return (
		<div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4 justify-end">
			<span>Less</span>
			<div className="h-3 w-3 rounded bg-muted/60" />
			<div className="h-3 w-3 rounded bg-primary/20" />
			<div className="h-3 w-3 rounded bg-primary/50" />
			<div className="h-3 w-3 rounded bg-primary/80" />
			<div className="h-3 w-3 rounded bg-primary" />
			<span>More</span>
		</div>
	);
}
