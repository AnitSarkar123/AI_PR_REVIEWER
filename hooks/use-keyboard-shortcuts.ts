"use client";

import { useEffect, useCallback } from "react";

interface Shortcut {
	key: string;
	ctrl?: boolean;
	alt?: boolean;
	shift?: boolean;
	handler: () => void;
	description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const isInput =
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement ||
				event.target instanceof HTMLSelectElement;

			for (const shortcut of shortcuts) {
				const ctrlMatch = shortcut.ctrl
					? event.ctrlKey || event.metaKey
					: true;
				const altMatch = shortcut.alt ? event.altKey : true;
				const shiftMatch = shortcut.shift ? event.shiftKey : true;
				const keyMatch =
					event.key.toLowerCase() === shortcut.key.toLowerCase();

				if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
					if (isInput && !shortcut.ctrl) continue;
					event.preventDefault();
					shortcut.handler();
					return;
				}
			}
		},
		[shortcuts]
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);
}
