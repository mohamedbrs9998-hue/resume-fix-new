import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';
import { createAuditLog } from '@/lib/audit';
import { getQueueJob, publishQueueJob, updateQueueJob } from '@/lib/queue';

export const runtime = 'nodejs';

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const formData = await request.formData();
  const queueJobId = String(formData.get('queueJobId') || '');
  const job = await getQueueJob(queueJobId);
  if (!job) {
    return NextResponse.redirect(new URL('/admin/jobs', request.url));
  }

  await updateQueueJob(job.id, { status: 'queued', lastError: null });
  await publishQueueJob(job).catch(async (error) => {
    await updateQueueJob(job.id, { status: 'retryable', lastError: error.message });
  });
  await createAuditLog({ actorEmail: session.email, action: 'queue.requeue', targetType: 'queue_job', targetId: job.id, metadata: { orderId: job.order_id } });

  return NextResponse.redirect(new URL('/admin/jobs', request.url));
}
