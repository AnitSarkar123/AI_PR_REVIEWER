"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ProfileForm } from "@/module/settings/components/profile-form";
import { RepositoryList } from "@/module/settings/components/repository-list";

const SettingsPageClient = () => {
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

			<ProfileForm />

			<RepositoryList />
		</div>
	);
};

export default SettingsPageClient;
