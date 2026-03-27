import { NextResponse } from 'next/server';
import { listQueueJobs, publishQueueJob, updateQueueJob } from '@/lib/queue';
import { captureAppError } from '@/lib/error-tracking';

export const runtime = 'nodejs';

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET || process.env.INTERNAL_QUEUE_TOKEN;
  if (!secret) return false;
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const jobs = await listQueueJobs(50);
  const retryable = jobs.filter((job) => ['queued', 'retryable'].includes(job.status) && new Date(job.run_at).getTime() <= now);
  const processed = [];

  for (const job of retryable) {
    try {
      await updateQueueJob(job.id, { status: 'queued' });
      const published = await publishQueueJob(job);
      processed.push({ id: job.id, status: 'queued', messageId: published?.messageId || null });
    } catch (error) {
      await captureAppError(error, { source: 'cron.republish', queueJobId: job.id, orderId: job.order_id }).catch(() => null);
    }
  }

  return NextResponse.json({ count: processed.length, processed });
}
