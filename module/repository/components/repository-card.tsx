'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Star } from 'lucide-react';

interface RepositoryCardProps {
  repo: {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    language: string | null;
    topics?: string[];
    isConnected?: boolean;
  };
  onConnect: (repo: any) => void;
  isConnecting: boolean;
}

export function RepositoryCard({ repo, onConnect, isConnecting }: RepositoryCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow border-border/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{repo.name}</CardTitle>
              <Badge variant={'outline'}>{repo.language || 'Unknown'}</Badge>
              {repo.isConnected && <Badge variant={'secondary'}>Connected</Badge>}
            </div>
            <CardDescription>{repo.description || 'No description provided.'}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" aria-label={`View ${repo.name} on GitHub`} asChild>
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button
              onClick={() => onConnect(repo)}
              disabled={isConnecting || repo.isConnected}
              variant={repo.isConnected ? 'ghost' : 'default'}
            >
              {isConnecting ? 'Connecting...' : repo.isConnected ? 'Connected' : 'Connect'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mr-2">
            <Star className="h-4 w-4 text-primary" fill="#ffe0c2" />
            <p>{repo.stargazers_count}</p>
          </div>
          {(repo.topics || []).map((topic: string) => (
            <Badge key={topic} variant="outline" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
