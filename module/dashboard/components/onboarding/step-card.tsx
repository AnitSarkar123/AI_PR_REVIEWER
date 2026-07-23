'use client';

import { LucideIcon } from 'lucide-react';

interface StepCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function StepCard({ icon: Icon, title, description }: StepCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border/60 hover:shadow-sm transition-all duration-200">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-sm leading-tight text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
