import { NextResponse } from 'next/server';
import { claimQueueJob, completeQueueJob, failQueueJob, getQueueJob, isQueueAuthorized, publishQueueJob } from '@/lib/queue';
import { fulfillOrder } from '@/lib/fulfillment';
import { captureAppError } from '@/lib/error-tracking';
import { verifyQstashSignature } from '@/lib/qstash-security';

export const runtime = 'nodejs';

export async function POST(request) {
  const rawBody = await request.text();

  if (!isQueueAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (process.env.QUEUE_DRIVER === 'qstash' && process.env.MOCK_MODE !== 'true') {
    try {
      await verifyQstashSignature(request, rawBody);
    } catch (error) {
      await captureAppError(error, { source: 'queue.signature' }).catch(() => null);
      return NextResponse.json({ error: 'Invalid queue signature' }, { status: 401 });
    }
  }

  const body = rawBody ? JSON.parse(rawBody) : {};
  const queueJobId = body?.queueJobId;
  const existing = await getQueueJob(queueJobId);
  if (!existing) {
    return NextResponse.json({ error: 'Queue job not found' }, { status: 404 });
  }

  const claimed = await claimQueueJob(queueJobId);
  if (!claimed) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'Already being handled' });
  }

  try {
    if (claimed.type === 'fulfill-order') {
      await fulfillOrder(claimed.order_id);
    }
    await completeQueueJob(claimed.id);
    return NextResponse.json({ ok: true, id: claimed.id });
  } catch (error) {
    const attempts = Number(claimed.attempts || 0) + 1;
    const updated = await failQueueJob(claimed.id, error.message, attempts);
    await captureAppError(error, {
      source: 'queue.worker',
      queueJobId: claimed.id,
      orderId: claimed.order_id,
      context: { attempts, type: claimed.type },
    });

    if (updated.status === 'retryable') {
      await publishQueueJob({ ...claimed, ...updated }).catch(() => null);
    }

    return NextResponse.json({ ok: false, id: claimed.id, status: updated.status }, { status: 500 });
  }
}
