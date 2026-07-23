'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Kbd } from '@/components/ui/kbd';

interface ShortcutEntry {
  keys: string[];
  description: string;
}

const SHORTCUTS: ShortcutEntry[] = [
  { keys: ['g', 'd'], description: 'Go to Dashboard' },
  { keys: ['g', 'r'], description: 'Go to Repositories' },
  { keys: ['g', 'v'], description: 'Go to Reviews' },
  { keys: ['g', 's'], description: 'Go to Subscriptions' },
  { keys: ['g', 'w'], description: 'Go to Webhooks' },
  { keys: ['g', 'e'], description: 'Go to Settings' },
  { keys: ['?'], description: 'Toggle this shortcuts dialog' },
  { keys: ['t'], description: 'Toggle dark/light theme' },
  { keys: ['Ctrl', 'k'], description: 'Focus search (when available)' },
];

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Navigate the dashboard faster using keyboard shortcuts. Press <Kbd>?</Kbd> at any time
            to open this dialog.
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shortcut</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SHORTCUTS.map((shortcut) => (
              <TableRow key={shortcut.description}>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <span key={key} className="flex items-center gap-1">
                        <Kbd>{key}</Kbd>
                        {i < shortcut.keys.length - 1 && (
                          <span className="text-muted-foreground text-xs">then</span>
                        )}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{shortcut.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
