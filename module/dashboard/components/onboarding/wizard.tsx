"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Bot,
} from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    icon: Github,
    title: "Connect a GitHub Repository",
    description:
      "Browse your GitHub repositories and connect the ones you want AI to review. We'll install webhooks automatically.",
    actionLabel: "Browse Repositories",
    actionHref: "/dashboard/repository",
    badge: "Step 1",
  },
  {
    icon: Bot,
    title: "Open or Update a Pull Request",
    description:
      "Create a new pull request or push changes to an existing one. Our webhook will automatically trigger an AI code review.",
    actionLabel: "Learn More",
    actionHref: "#",
    badge: "Step 2",
  },
  {
    icon: MessageSquare,
    title: "Review the AI Feedback",
    description:
      "View detailed AI-generated code reviews with walkthroughs, issues, and suggestions. Export reviews or share them with your team.",
    actionLabel: "View Reviews",
    actionHref: "/dashboard/reviews",
    badge: "Step 3",
  },
];

export function OnboardingWizard({ onDismiss }: { onDismiss?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {step.badge} of {STEPS.length}
            </Badge>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss} className="text-muted-foreground">
              Dismiss
            </Button>
          )}
        </div>
        <CardTitle className="flex items-center gap-3 mt-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <step.icon className="h-5 w-5" />
          </div>
          <span>{step.title}</span>
        </CardTitle>
        <CardDescription className="text-sm mt-2 leading-relaxed">
          {step.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-colors ${
                  idx === currentStep
                    ? "bg-primary"
                    : idx < currentStep
                    ? "bg-primary/40"
                    : "bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={handlePrev} className="gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <Button variant="outline" size="sm" onClick={handleNext} className="gap-1">
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button size="sm" asChild className="gap-1.5">
                <Link href={step.actionHref}>
                  {step.actionLabel}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
