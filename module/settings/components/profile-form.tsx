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
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

import { getUserProfile, updateUserProfile } from "../actions";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

function validateEmail(email: string): string | null {
	if (!email) return null;
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!re.test(email)) return "Please enter a valid email address";
	return null;
}

export function ProfileForm() {
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const initialRef = useRef({ name: "", email: "" });

	const hasUnsavedChanges = name !== initialRef.current.name || email !== initialRef.current.email;
	useUnsavedChanges(hasUnsavedChanges);

	const emailError = email ? validateEmail(email) : null;

	const { data: profile, isLoading } = useQuery({
		queryKey: ["user-profile"],
		queryFn: async () => await getUserProfile(),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (profile) {
			setName(profile.name || "");
			setEmail(profile.email || "");
			initialRef.current = { name: profile.name || "", email: profile.email || "" };
		}
	}, [profile]);

	const updateMutation = useMutation({
		mutationFn: async (data: { name: string; email: string }) => {
			return await updateUserProfile(data);
		},
		onSuccess: (result) => {
			if (result?.success) {
				queryClient.invalidateQueries({ queryKey: ["user-profile"] });
				initialRef.current = { name, email };
				toast.success("Profile updated successfully");
			} else {
				toast.error("Failed to update profile", {
					description: result?.error || "An unexpected error occurred.",
				});
			}
		},
		onError: (error: Error) => {
			toast.error("Failed to update profile", {
				description: error.message || "An error occurred while updating your profile.",
			});
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (emailError) {
			toast.error("Please fix the validation errors before saving");
			return;
		}
		updateMutation.mutate({ name, email });
	};

	const handleReset = () => {
		setName(initialRef.current.name);
		setEmail(initialRef.current.email);
	};

	const isValid = !emailError || !email;

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
							aria-invalid={!!emailError}
						/>
						{emailError && (
							<p className="text-xs text-destructive flex items-center gap-1 mt-1" role="alert">
								<AlertTriangle className="h-3 w-3" />
								{emailError}
							</p>
						)}
					</div>

					{hasUnsavedChanges && (
						<div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
							<AlertTriangle className="h-3.5 w-3.5 shrink-0" />
							<span>You have unsaved changes</span>
						</div>
					)}

					{updateMutation.isSuccess && updateMutation.data?.success && (
						<div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
							<CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
							<span>Profile saved successfully</span>
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
						<Button
							type="submit"
							disabled={updateMutation.isPending || !hasUnsavedChanges || !!emailError}
						>
							{updateMutation.isPending ? (
								<span className="flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									Saving...
								</span>
							) : (
								"Save Changes"
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}