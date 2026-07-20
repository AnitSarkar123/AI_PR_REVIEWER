"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getUserProfile } from "@/module/settings/actions";
import { ProfileDetails } from "@/module/settings/components/profile-details";
import { ProfileEditForm } from "@/module/settings/components/profile-edit-form";
import { RepositoryList } from "@/module/settings/components/repository-list";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

const SettingsPageClient = () => {
	const [isEditing, setIsEditing] = useState(false);

	const { data: profile, isLoading } = useQuery({
		queryKey: ["user-profile"],
		queryFn: async () => await getUserProfile(),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
					<p className="text-muted-foreground">
						Manage your account settings and connected repositories.
					</p>
				</div>
				<Button variant="outline" size="sm" asChild>
					<Link href="/dashboard/repository" className="gap-2">
						<ExternalLink className="h-4 w-4" />
						Browse Repositories
					</Link>
				</Button>
			</div>

			{isLoading ? (
				<Card>
					<CardHeader>
						<CardTitle>Profile Settings</CardTitle>
						<CardDescription>
							Loading profile data...
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="animate-pulse space-y-4">
							<div className="h-10 bg-muted rounded" />
							<div className="h-10 bg-muted rounded" />
						</div>
					</CardContent>
				</Card>
			) : profile ? (
				isEditing ? (
					<ProfileEditForm profile={profile} onCancel={() => setIsEditing(false)} />
				) : (
					<ProfileDetails profile={profile} onEdit={() => setIsEditing(true)} />
				)
			) : (
				<Card>
					<CardContent className="pt-6 text-center text-muted-foreground">
						Failed to load profile. Please try refreshing.
					</CardContent>
				</Card>
			)}

			<RepositoryList />
		</div>
	);
};

export default SettingsPageClient;
