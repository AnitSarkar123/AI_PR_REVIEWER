"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog";

export function KeyboardShortcutsProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { setTheme, theme } = useTheme();
	const [shortcutsOpen, setShortcutsOpen] = useState(false);

	const navigateTo = useCallback(
		(path: string) => {
			router.push(path);
		},
		[router]
	);

	useKeyboardShortcuts([
		{
			key: "?",
			handler: () => setShortcutsOpen((prev) => !prev),
			description: "Toggle shortcuts",
		},
		{
			key: "d",
			handler: () => navigateTo("/dashboard"),
			description: "Dashboard",
		},
		{
			key: "r",
			handler: () => navigateTo("/dashboard/repository"),
			description: "Repositories",
		},
		{
			key: "v",
			handler: () => navigateTo("/dashboard/reviews"),
			description: "Reviews",
		},
		{
			key: "s",
			handler: () => navigateTo("/dashboard/subscriptions"),
			description: "Subscriptions",
		},
		{
			key: "w",
			handler: () => navigateTo("/dashboard/webhooks"),
			description: "Webhooks",
		},
		{
			key: "e",
			handler: () => navigateTo("/dashboard/settings"),
			description: "Settings",
		},
		{
			key: "t",
			handler: () =>
				setTheme(theme === "dark" ? "light" : "dark"),
			description: "Toggle theme",
		},
	]);

	return (
		<>
			<KeyboardShortcutsDialog
				open={shortcutsOpen}
				onOpenChange={setShortcutsOpen}
			/>
			{children}
		</>
	);
}
