import { NextResponse, NextRequest } from 'next/server';
import { reviewPullRequest } from '@/module/ai/actions';
import {
  verifyWebhookSignature,
  checkRateLimit,
  validateWebhookPayload,
} from '@/lib/webhook-verify';

interface WebhookLogEntry {
  timestamp: string;
  event: string | null;
  action: string | null;
  repository: string;
  prNumber: number | null;
  status: 'received' | 'processing' | 'completed' | 'error';
  message: string;
}

function createLogEntry(
  event: string | null,
  action: string | null,
  repository: string,
  prNumber: number | null,
  status: WebhookLogEntry['status'],
  message: string,
): WebhookLogEntry {
  return {
    timestamp: new Date().toISOString(),
    event,
    action,
    repository,
    prNumber,
    status,
    message,
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const log: WebhookLogEntry[] = [];

  try {
    const body = await req.json();
    const event = req.headers.get('X-GitHub-Event');
    const deliveryId = req.headers.get('X-GitHub-Delivery');
    const repository =
      body.repository?.full_name ||
      `${body.repository?.owner?.login}/${body.repository?.name}` ||
      'unknown';

    log.push(
      createLogEntry(
        event,
        body.action,
        repository,
        body.number || null,
        'received',
        `Webhook received (delivery: ${deliveryId || 'unknown'})`,
      ),
    );

    console.log(`[WEBHOOK] Delivery ${deliveryId}: ${event} on ${repository}`);

    if (event === 'ping') {
      log.push(createLogEntry(event, null, repository, null, 'completed', 'Ping acknowledged'));
      return NextResponse.json(
        {
          message: 'pong',
          delivery: deliveryId,
          _log: log,
        },
        { status: 200 },
      );
    }

    if (event === 'pull_request') {
      const action = body.action;
      const prNumber = body.number;
      const owner = body.repository.owner.login;
      const repo = body.repository.name;

      log.push(
        createLogEntry(
          event,
          action,
          repository,
          prNumber,
          'processing',
          `PR ${action}: #${prNumber}`,
        ),
      );

      if (action === 'opened' || action === 'synchronize') {
        console.log(`[WEBHOOK] Triggering review for ${owner}/${repo}#${prNumber}`);

        reviewPullRequest(owner, repo, prNumber)
          .then(() => {
            console.log(
              `[WEBHOOK] Review process completed for ${owner}/${repo}#${prNumber} (took ${Date.now() - startTime}ms)`,
            );
          })
          .catch((error) => {
            console.error(
              `[WEBHOOK] Review process failed for ${owner}/${repo}#${prNumber}:`,
              error,
            );
          });

        log.push(
          createLogEntry(
            event,
            action,
            repository,
            prNumber,
            'completed',
            `Review queued for PR #${prNumber}`,
          ),
        );
      } else {
        log.push(
          createLogEntry(
            event,
            action,
            repository,
            prNumber,
            'completed',
            `Ignored action: ${action}`,
          ),
        );
      }
    }

    const duration = Date.now() - startTime;
    return NextResponse.json(
      {
        message: 'Event received',
        delivery: deliveryId,
        duration: `${duration}ms`,
        _log: log,
      },
      { status: 200 },
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[WEBHOOK] Error after ${duration}ms:`, error);

    log.push(
      createLogEntry(
        null,
        null,
        'unknown',
        null,
        'error',
        `Handler error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );

    return NextResponse.json(
      {
        message: 'Error handling webhook',
        error: error instanceof Error ? error.message : 'Unknown error',
        _log: log,
      },
      { status: 500 },
    );
  }
}
