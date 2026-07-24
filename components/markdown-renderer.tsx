'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clipboard, ClipboardCheck } from 'lucide-react';

function parseInline(text: string) {
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-rose-600 dark:text-rose-400 font-medium"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 overflow-hidden rounded-lg border border-border bg-zinc-950 font-mono text-xs text-zinc-100 shadow-md">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2 text-zinc-400">
        <span className="font-semibold text-[10px] uppercase tracking-wider">
          {language || 'code'}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          onClick={handleCopy}
          aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
        >
          {copied ? (
            <ClipboardCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          ) : (
            <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-zinc-300">{code}</code>
      </pre>
    </div>
  );
}

/**
 * Renders markdown content with support for code blocks and inline formatting.
 */
export function MarkdownRenderer({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const lines = part.split('\n');
          const language = lines[0].replace('```', '').trim();
          const code = lines.slice(1, -1).join('\n');
          return <CodeBlock key={index} language={language} code={code} />;
        }

        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-2">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lineIdx} className="h-2" />;

              if (trimmed.startsWith('### ')) {
                return (
                  <h4
                    key={lineIdx}
                    className="text-base font-semibold mt-4 text-foreground tracking-tight"
                  >
                    {trimmed.slice(4)}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3
                    key={lineIdx}
                    className="text-lg font-bold mt-6 border-b border-border pb-1 text-foreground tracking-tight"
                  >
                    {trimmed.slice(3)}
                  </h3>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2
                    key={lineIdx}
                    className="text-xl font-extrabold mt-8 text-foreground tracking-tight"
                  >
                    {trimmed.slice(2)}
                  </h2>
                );
              }

              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <ul key={lineIdx} className="list-disc pl-5 my-1 space-y-1">
                    <li className="text-muted-foreground">
                      <span className="text-foreground/90">{parseInline(trimmed.slice(2))}</span>
                    </li>
                  </ul>
                );
              }

              if (/^\d+\.\s/.test(trimmed)) {
                const match = trimmed.match(/^(\d+\.\s)(.*)/);
                return (
                  <ol key={lineIdx} className="list-decimal pl-5 my-1 space-y-1">
                    <li className="text-muted-foreground">
                      <span className="text-foreground/90">
                        {parseInline(match ? match[2] : trimmed)}
                      </span>
                    </li>
                  </ol>
                );
              }

              return (
                <p key={lineIdx} className="my-2 text-foreground/80">
                  {parseInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function ReviewPreview({
  content,
  maxLength = 300,
}: {
  content: string;
  maxLength?: number;
}) {
  return (
    <div className="bg-muted/50 border border-border/60 p-4 rounded-lg">
      <pre className="whitespace-pre-wrap text-xs font-mono text-foreground/80 line-clamp-6">
        {content.substring(0, maxLength)}
        {content.length > maxLength ? '...' : ''}
      </pre>
    </div>
  );
}

export { CodeBlock, parseInline };
