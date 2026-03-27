import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase';
import { captureAppError } from '@/lib/error-tracking';

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

function getQueueEndpoint() {
  return `${getAppUrl()}/api/internal/process-job`;
}

function getQueueAuthHeader() {
  const token = process.env.INTERNAL_QUEUE_TOKEN || process.env.CRON_SECRET;
  if (!token) {
    throw new Error('Missing INTERNAL_QUEUE_TOKEN');
  }
  return `Bearer ${token}`;
}

export async function createQueueJob({ type, orderId, payload = {}, runAt = null }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('queue_jobs')
    .insert({
      type,
      order_id: orderId,
      payload_json: payload,
      status: 'queued',
      run_at: runAt || new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateQueueJob(id, patch) {
  const supabase = getSupabaseAdmin();
  const updates = {};
  if ('status' in patch) updates.status = patch.status;
  if ('attempts' in patch) updates.attempts = patch.attempts;
  if ('lastError' in patch) updates.last_error = patch.lastError;
  if ('qstashMessageId' in patch) updates.qstash_message_id = patch.qstashMessageId;
  if ('startedAt' in patch) updates.started_at = patch.startedAt;
  if ('finishedAt' in patch) updates.finished_at = patch.finishedAt;
  if ('runAt' in patch) updates.run_at = patch.runAt;
  if ('payload' in patch) updates.payload_json = patch.payload;

  const { data, error } = await supabase.from('queue_jobs').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function getQueueJob(id) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('queue_jobs').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listQueueJobs(limit = 100) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('queue_jobs').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
}

export async function claimQueueJob(id) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('queue_jobs')
    .update({ status: 'processing', started_at: new Date().toISOString() })
    .eq('id', id)
    .in('status', ['queued', 'retryable'])
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function completeQueueJob(id) {
  return updateQueueJob(id, { status: 'completed', finishedAt: new Date().toISOString(), lastError: null });
}

export async function failQueueJob(id, errorMessage, attempts) {
  const maxAttempts = Number(process.env.QUEUE_MAX_ATTEMPTS || 5);
  const status = attempts >= maxAttempts ? 'failed' : 'retryable';
  const runAt = status === 'retryable'
    ? new Date(Date.now() + Math.min(15 * 60 * 1000, (attempts + 1) * 60 * 1000)).toISOString()
    : null;
  return updateQueueJob(id, {
    status,
    attempts,
    lastError: errorMessage,
    finishedAt: new Date().toISOString(),
    runAt,
  });
}

export async function publishQueueJob(job) {
  if (process.env.MOCK_MODE === 'true' || process.env.QUEUE_DRIVER === 'inline') {
    return { queued: false, mode: 'inline' };
  }

  const qstashToken = process.env.QSTASH_TOKEN;
  if (!qstashToken) {
    throw new Error('Missing QSTASH_TOKEN');
  }

  const publishUrl = `${process.env.QSTASH_URL || 'https://qstash.upstash.io'}/v2/publish/${encodeURIComponent(getQueueEndpoint())}`;
  const response = await fetch(publishUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${qstashToken}`,
      'Content-Type': 'application/json',
      'Upstash-Method': 'POST',
      'Upstash-Retries': process.env.QSTASH_RETRIES || '5',
      'Upstash-Deduplication-Id': `order-${job.order_id}-job-${job.id}`,
      'Upstash-Header-Authorization': getQueueAuthHeader(),
    },
    body: JSON.stringify({
      queueJobId: job.id,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`QStash publish failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  await updateQueueJob(job.id, { qstashMessageId: data.messageId || data.message_id || null });
  return data;
}

export async function enqueueOrderFulfillment(orderId) {
  const job = await createQueueJob({
    type: 'fulfill-order',
    orderId,
    payload: { orderId, correlationId: crypto.randomUUID() },
  });

  try {
    const published = await publishQueueJob(job);
    return { job, published };
  } catch (error) {
    await captureAppError(error, {
      source: 'queue.publish',
      orderId,
      queueJobId: job.id,
      context: { type: 'fulfill-order' },
    });
    await updateQueueJob(job.id, { status: 'retryable', lastError: error.message });
    throw error;
  }
}

export function isQueueAuthorized(request) {
  const auth = request.headers.get('authorization');
  return auth === getQueueAuthHeader();
}
