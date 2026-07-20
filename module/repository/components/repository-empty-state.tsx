import { FolderOpen, SearchX, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RepositoryEmptyStateProps {
	type: "no-results" | "no-repositories" | "loading-error";
	searchQuery?: string;
	onRetry?: () => void;
}

/**
 * Renders empty or error state card views for the repository list screen.
 */
export function RepositoryEmptyState({
	type,
	searchQuery,
	onRetry,
}: RepositoryEmptyStateProps) {
	if (type === "no-results") {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center py-12 space-y-3">
						<SearchX className="h-10 w-10 mx-auto text-muted-foreground" />
						<div>
							<p className="text-lg font-medium text-foreground">
								No repositories found
							</p>
							<p className="text-sm text-muted-foreground mt-1">
								{searchQuery
									? `No repositories match "${searchQuery}". Try a different search term.`
									: "No repositories match your current filters."}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (type === "loading-error") {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center py-12 space-y-3">
						<FolderOpen className="h-10 w-10 mx-auto text-destructive" />
						<div>
							<p className="text-lg font-medium text-foreground">
								Failed to load repositories
							</p>
							<p className="text-sm text-muted-foreground mt-1">
								There was an error fetching your repositories.
								Please try again.
							</p>
						</div>
						{onRetry && (
							<Button variant="outline" size="sm" onClick={onRetry}>
								Try Again
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardContent className="pt-6">
				<div className="text-center py-12 space-y-3">
					<Github className="h-10 w-10 mx-auto text-muted-foreground" />
					<div>
						<p className="text-lg font-medium text-foreground">
							No repositories connected
						</p>
						<p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
							Connect your GitHub repositories to enable
							AI-powered code reviews. Search and connect
							repositories from your GitHub account above.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
