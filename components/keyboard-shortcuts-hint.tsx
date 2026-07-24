'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Keyboard } from 'lucide-react';
import { KeyboardShortcutsDialog } from './keyboard-shortcuts-dialog';

export function KeyboardShortcutsHint() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setOpen(true)}
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Keyboard shortcuts (?)</p>
        </TooltipContent>
      </Tooltip>
      <KeyboardShortcutsDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
