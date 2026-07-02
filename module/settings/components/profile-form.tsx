"use client";

import {
	Card,
	CardDescription,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import { getUserProfile, updateUserProfile } from "../actions";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

export function ProfileForm() {
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");

	const initialValues = useMemo(() => ({ name: "", email: "" }), []);
	const hasUnsavedChanges = name !== initialValues.name || email !== initialValues.email;
	useUnsavedChanges(hasUnsavedChanges);

	const handleReset = () => {
		if (profile) {
			setName(profile.name || "");
			setEmail(profile.email || "");
		}
	};

	const { data: profile, isLoading } = useQuery({
		queryKey: ["user-profile"],
		queryFn: async () => await getUserProfile(),
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (profile) {
			setName(profile.name || "");
			setEmail(profile.email || "");
			initialValues.name = profile.name || "";
			initialValues.email = profile.email || "";
		}
	}, [profile, initialValues]);

	const updateMutation = useMutation({
		mutationFn: async (data: { name: string; email: string }) => {
			return await updateUserProfile(data);
		},
		onSuccess: (result) => {
			if (result?.success) {
				queryClient.invalidateQueries({ queryKey: ["user-profile"] });
				toast.success("Profile updated successfully");
			}
		},
		onError: (error: any) => {
			toast.error("Failed to update profile", {
				description:
					error.message ||
					"An error occurred while updating your profile.",
			});
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateMutation.mutate({ name, email });
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Profile Settings</CardTitle>
					<CardDescription>
						Update your profile information
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="animate-pulse space-y-4">
						<div className="h-10 bg-muted rounded" />
						<div className="h-10 bg-muted rounded" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile Settings</CardTitle>
				<CardDescription>
					Update your profile information
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="name">Full Name</Label>
						<Input
							id="name"
							placeholder="Enter your full name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={updateMutation.isPending}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={updateMutation.isPending}
						/>
					</div>

					{hasUnsavedChanges && (
						<div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
							<AlertTriangle className="h-3.5 w-3.5 shrink-0" />
							<span>You have unsaved changes</span>
						</div>
					)}
					<div className="flex items-center gap-3">
						{hasUnsavedChanges && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleReset}
								disabled={updateMutation.isPending}
							>
								Reset
							</Button>
						)}
						<Button type="submit" disabled={updateMutation.isPending || !hasUnsavedChanges}>
							{updateMutation.isPending
								? "Saving..."
								: "Save Changes"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
