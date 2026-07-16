"use client";

import { Check, X } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface TierFeature {
	name: string;
	free: boolean;
	pro: boolean;
}

const FEATURES: TierFeature[] = [
	{ name: "Connected repositories", free: true, pro: true },
	{ name: "Repository limit", free: true, pro: true },
	{ name: "Reviews per repository", free: true, pro: true },
	{ name: "Code review analysis", free: true, pro: true },
	{ name: "Community support", free: true, pro: true },
	{ name: "Unlimited repositories", free: false, pro: true },
	{ name: "Unlimited reviews", free: false, pro: true },
	{ name: "Advanced AI analysis", free: false, pro: true },
	{ name: "Priority email support", free: false, pro: true },
	{ name: "Advanced analytics", free: false, pro: true },
];

export function TierComparisonTable() {
	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[250px]">Feature</TableHead>
						<TableHead className="text-center">
							<div className="flex flex-col items-center gap-1">
								<span>Free</span>
								<Badge variant="outline" className="font-normal">
									$0/mo
								</Badge>
							</div>
						</TableHead>
						<TableHead className="text-center">
							<div className="flex flex-col items-center gap-1">
								<span>Pro</span>
								<Badge variant="default" className="font-normal">
									$9.99/mo
								</Badge>
							</div>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{FEATURES.map((feature) => (
						<TableRow key={feature.name}>
							<TableCell className="font-medium">
								{feature.name}
							</TableCell>
							<TableCell className="text-center">
								{feature.free ? (
									<Check className="h-4 w-4 mx-auto text-primary" />
								) : (
									<X className="h-4 w-4 mx-auto text-muted-foreground" />
								)}
							</TableCell>
							<TableCell className="text-center">
								{feature.pro ? (
									<Check className="h-4 w-4 mx-auto text-primary" />
								) : (
									<X className="h-4 w-4 mx-auto text-muted-foreground" />
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
