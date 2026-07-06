"use client";

import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, GitCommit } from "lucide-react";

import { getContributionStats } from "../actions";

const ContributionGraph = () => {
	const { theme } = useTheme();

	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["contribution-graph"],
		queryFn: async () => await getContributionStats(),
		staleTime: 1000 * 60 * 5,
	});

	if (isLoading) {
		return (
			<div className="w-full flex flex-col items-center justify-center p-8">
				<div className="flex flex-col items-center gap-3">
					<div className="animate-pulse flex gap-1">
						{Array.from({ length: 20 }).map((_, i) => (
							<div key={i} className="w-3 h-3 bg-muted rounded-sm" />
						))}
					</div>
					<p className="text-sm text-muted-foreground animate-pulse">
						Loading contribution data...
					</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="w-full flex flex-col items-center justify-center p-8">
				<GitCommit className="h-8 w-8 text-muted-foreground/40 mb-2" />
				<p className="text-sm text-muted-foreground">
					Failed to load contribution data
				</p>
				<button
					onClick={() => refetch()}
					className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
				>
					<RefreshCw className="h-3 w-3" />
					Try again
				</button>
			</div>
		);
	}

	if (!data || !data.contributions.length) {
		return (
			<div className="w-full flex flex-col items-center justify-center p-8">
				<GitCommit className="h-8 w-8 text-muted-foreground/40 mb-2" />
				<p className="text-sm text-muted-foreground">
					No contribution data available yet
				</p>
				<p className="text-xs text-muted-foreground/60 mt-1">
					Contributions appear once you start pushing code to GitHub
				</p>
			</div>
		);
	}

	return (
		<div className="w-full flex flex-col items-center gap-4 p-4">
			<div className="text-sm text-muted-foreground">
				<span className="font-semibold text-foreground">
					{data.totalContributions}
				</span>{" "}
				contributions in last year
			</div>

			<div className="w-full overflow-x-auto">
				<div className="flex justify-center min-w-max px-4">
					<ActivityCalendar
						data={data.contributions}
						colorScheme={theme === "dark" ? "dark" : "light"}
                        blockSize={11}
                        blockMargin={4}
                        fontSize={14}
                        showWeekdayLabels
                        showMonthLabels
                        theme={
                            {
                                light: ["hsl(0, 0%, 92%)", "hsl(142, 71%, 45%)"],
                                dark: ["#161b22", "hsl(142, 71%, 45%)"]
                            }
                        }
					/>
				</div>
			</div>
		</div>
	);
};

export default ContributionGraph;
