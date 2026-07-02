"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportReview, type ExportFormat } from "../actions/export";

interface ReviewExportButtonProps {
	reviewId: string;
}

export function ReviewExportButton({ reviewId }: ReviewExportButtonProps) {
	const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);

	const handleExport = async (format: ExportFormat) => {
		setIsExporting(format);
		try {
			const result = await exportReview(reviewId, format);
			if (!result) {
				toast.error("Review not found or access denied");
				return;
			}

			const blob = new Blob([result.content], {
				type:
					format === "json"
						? "application/json"
						: "text/markdown",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = result.filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast.success(`Review exported as ${format.toUpperCase()}`);
		} catch (error) {
			toast.error("Failed to export review");
			console.error("Export error:", error);
		} finally {
			setIsExporting(null);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="gap-1.5">
					{isExporting ? (
						<Loader2 className="h-3.5 w-3.5 animate-spin" />
					) : (
						<Download className="h-3.5 w-3.5" />
					)}
					Export
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => handleExport("markdown")}
					disabled={isExporting !== null}
					className="gap-2"
				>
					<FileText className="h-4 w-4" />
					<span>Export as Markdown</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => handleExport("json")}
					disabled={isExporting !== null}
					className="gap-2"
				>
					<FileJson className="h-4 w-4" />
					<span>Export as JSON</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
