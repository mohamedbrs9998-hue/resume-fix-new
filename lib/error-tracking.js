import * as Sentry from '@sentry/nextjs';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function logErrorEvent({
  source = 'app',
  severity = 'error',
  message = 'Unknown error',
  orderId = null,
  queueJobId = null,
  context = {},
  stack = null,
}) {
  try {
    const supabase = getSupabaseAdmin();
    const payload = {
      source,
      severity,
      message,
      order_id: orderId,
      queue_job_id: queueJobId,
      context_json: context,
      stack,
    };
    const { error } = await supabase.from('error_events').insert(payload);
    if (error) throw error;
  } catch (loggingError) {
    console.error('Failed to log error event', loggingError);
  }
}

export async function captureAppError(error, meta = {}) {
  const message = error?.message || meta.message || 'Unknown error';
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: {
        source: meta.source || 'app',
      },
      extra: meta,
    });
  }

  await logErrorEvent({
    source: meta.source || 'app',
    severity: meta.severity || 'error',
    message,
    orderId: meta.orderId || null,
    queueJobId: meta.queueJobId || null,
    context: meta.context || {},
    stack: error?.stack || null,
  });
}

export async function listErrorEvents(limit = 100) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('error_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
