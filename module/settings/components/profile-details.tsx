"use client";

import {
	Card,
	CardDescription,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface ProfileDetailsProps {
	profile: {
		name: string;
		email: string;
		image?: string | null;
		createdAt?: string | Date;
	};
	onEdit: () => void;
}

export function ProfileDetails({ profile, onEdit }: ProfileDetailsProps) {
	const userInitials = profile.name
		? profile.name
				.split(" ")
				.map((s) => s[0])
				.join("")
				.toUpperCase()
		: "U";

	const formattedDate = profile.createdAt
		? format(new Date(profile.createdAt), "MMMM dd, yyyy")
		: "N/A";

	return (
		<Card className="border-border/80">
			<CardHeader>
				<CardTitle>Profile Details</CardTitle>
				<CardDescription>
					Your personal account details
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex items-center gap-4">
					<Avatar className="w-16 h-16 rounded-lg">
						<AvatarImage src={profile.image || "/placeholder.svg"} alt={profile.name} />
						<AvatarFallback className="rounded-lg text-lg font-bold">{userInitials}</AvatarFallback>
					</Avatar>
					<div>
						<h3 className="font-semibold text-lg">{profile.name}</h3>
						<p className="text-sm text-muted-foreground">{profile.email}</p>
					</div>
				</div>

				<div className="border-t pt-4 space-y-3">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Account Status</span>
						<span className="font-medium text-emerald-500">Active</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">Joined On</span>
						<span className="font-medium text-foreground">{formattedDate}</span>
					</div>
				</div>

				<div className="pt-2">
					<Button onClick={onEdit} variant="outline" size="sm">
						Edit Profile
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
