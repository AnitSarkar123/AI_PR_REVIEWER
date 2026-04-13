import { NextResponse, NextRequest } from 'next/server'
// import { the } from '../../../../.next/dev/types/validator';
import { reviewPullRequest } from '@/module/ai/actions';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const event = req.headers.get("X-gitHub-event")
        if (event == "ping") {
            return NextResponse.json({ message: "pong" }, { status: 200 })

        }
        if (event === "pull_request") {
            const action = body.action;
            const prNumber = body.number;

            const owner = body.repository.owner.login;
            const repo = body.repository.name;
            if (action === "opened" || action === "synchronize") {
                reviewPullRequest(owner, repo, prNumber).then(() => console.log(`PR review process completed for PR ${owner}/${repo}#${prNumber}`)).catch((error) => console.log(`Error in PR review process of ${owner}/${repo}#${prNumber}`, error))
            }


        }
        //HANDELED LATER
        return NextResponse.json({ message: "Event received" }, { status: 200 })
    } catch (error) {
        console.log("Error handling GitHub webhook:", error)
        return NextResponse.json({ message: "Error handling webhook" }, { status: 500 })
    }
}