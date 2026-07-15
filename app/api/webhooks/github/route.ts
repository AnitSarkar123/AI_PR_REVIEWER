import { NextResponse, NextRequest } from 'next/server'
import { reviewPullRequest } from '@/module/ai/actions';
import { verifyWebhookSignature, checkRateLimit, validateWebhookPayload } from '@/lib/webhook-verify';

export async function POST(req: NextRequest) {
    try {
        const bodyText = await req.text();
        const signature = req.headers.get("x-hub-signature-256");
        const event = req.headers.get("x-github-event");
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

        if (!verifyWebhookSignature(bodyText, signature)) {
            return NextResponse.json({ message: "Invalid webhook signature" }, { status: 401 })
        }

        const rateLimitResult = checkRateLimit(ip);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { message: "Rate limit exceeded. Try again later." },
                {
                    status: 429,
                    headers: { "Retry-After": String(rateLimitResult.retryAfter) }
                }
            )
        }

        const body = JSON.parse(bodyText);

        if (event === "ping") {
        return NextResponse.json({ message: "pong" }, { status: 200 })
        } //Handle ping event first 

        if (!validateWebhookPayload(body)) {
            return NextResponse.json({ message: "Invalid webhook payload structure" }, { status: 400 })
        }


        if (event === "pull_request") {
            const action = body.action;
            const prNumber = body.number;
            const owner = body.repository.owner.login;
            const repo = body.repository.name;

            if (action === "opened" || action === "synchronize") {
                reviewPullRequest(owner, repo, prNumber)
                    .then((result) => {
                        if (result?.success) {
                            console.log(`[WEBHOOK] PR review requested successfully for ${owner}/${repo}#${prNumber}: ${result.message}`);
                        } else {
                            console.warn(`[WEBHOOK] PR review completed with issues for ${owner}/${repo}#${prNumber}: ${result?.message}`);
                        }
                    })
                    .catch((error) => {
                        console.error(`[WEBHOOK] PR review failed for ${owner}/${repo}#${prNumber}:`, error);
                    })
            }
        }

        return NextResponse.json({ message: "Event received" }, { status: 200 })
    } catch (error) {
        console.error("[WEBHOOK] Error handling GitHub webhook:", error)
        return NextResponse.json({ message: "Error handling webhook" }, { status: 500 })
    }
}
