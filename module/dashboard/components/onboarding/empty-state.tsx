"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GitBranch, GitPullRequest, MessageSquare, Github, Bot } from "lucide-react";
import { OnboardingWizard } from "./wizard";

export function EmptyDashboardState() {
  return (
    <div className="space-y-6 mt-6">
      <div className="text-center space-y-3 py-8">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome to AI PR Reviewer
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Get started by connecting your first GitHub repository. We will
          automatically review every pull request you open.
        </p>
      </div>

      <OnboardingWizard />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
        <Card className="border-dashed border-muted-foreground/20 bg-muted/10">
          <CardHeader className="pb-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground/45">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Connected Repositories
            </p>
          </CardContent>
        </Card>
        <Card className="border-dashed border-muted-foreground/20 bg-muted/10">
          <CardHeader className="pb-2">
            <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground/45">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pull Requests Reviewed
            </p>
          </CardContent>
        </Card>
        <Card className="border-dashed border-muted-foreground/20 bg-muted/10">
          <CardHeader className="pb-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground/45">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              AI Reviews Generated
            </p>
          </CardContent>
        </Card>
        <Card className="border-dashed border-muted-foreground/20 bg-muted/10">
          <CardHeader className="pb-2">
            <Github className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground/45">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              GitHub Contributions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
