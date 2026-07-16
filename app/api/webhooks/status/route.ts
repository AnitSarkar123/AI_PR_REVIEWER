import { NextResponse } from "next/server";

interface CheckResult {
	name: string;
	status: "healthy" | "degraded" | "unhealthy";
	details?: string;
}

export async function GET() {
	const checks: CheckResult[] = [];

	// Check webhook URL configuration
	const webhookUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
	if (webhookUrl) {
		checks.push({
			name: "Webhook Base URL",
			status: "healthy",
			details: `${webhookUrl}/api/webhooks/github`,
		});
	} else {
		checks.push({
			name: "Webhook Base URL",
			status: "unhealthy",
			details: "NEXT_PUBLIC_APP_BASE_URL is not configured",
		});
	}

	// Check database connectivity indicator
	const dbUrl = process.env.DATABASE_URL;
	checks.push({
		name: "Database Configuration",
		status: dbUrl ? "healthy" : "unhealthy",
		details: dbUrl ? "Database URL configured" : "DATABASE_URL is not set",
	});

	const allHealthy = checks.every((c) => c.status === "healthy");

	return NextResponse.json(
		{
			service: "AI PR Reviewer Webhook",
			status: allHealthy ? "healthy" : "degraded",
			timestamp: new Date().toISOString(),
			checks,
		},
		{
			status: allHealthy ? 200 : 503,
		}
	);
}
