import crypto from 'crypto';
import { getSupabaseAdmin, getUploadsBucket } from '@/lib/supabase';

function createAccessToken() {
  return crypto.randomBytes(18).toString('hex');
}

function normalizeOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    accessToken: row.access_token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    processingStartedAt: row.processing_started_at,
    completedAt: row.completed_at,
    status: row.status,
    deliveryStatus: row.delivery_status,
    plan: row.plan,
    amountAed: row.amount_aed,
    fullName: row.full_name,
    email: row.email,
    targetRole: row.target_role,
    targetCountry: row.target_country,
    jobDescription: row.job_description,
    originalFileName: row.original_file_name,
    originalFilePath: row.original_file_path,
    originalFileUrl: row.original_file_url,
    resumeText: row.resume_text,
    fileScan: row.file_scan_json || null,
    uploadSha256: row.upload_sha256 || null,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    failureReason: row.failure_reason,
    emailMessageId: row.email_message_id,
    result: row.result_json,
    generatedFiles: row.generated_files_json || {},
  };
}

export async function createOrder(data) {
  const supabase = getSupabaseAdmin();
  const payload = {
    access_token: createAccessToken(),
    status: 'pending_payment',
    delivery_status: 'not_sent',
    full_name: data.fullName,
    email: data.email,
    target_role: data.targetRole,
    target_country: data.targetCountry,
    plan: data.plan,
    amount_aed: data.amountAed,
    job_description: data.jobDescription || '',
    resume_text: data.resumeText,
    original_file_name: data.originalFileName,
    original_file_path: data.originalFilePath,
    original_file_url: data.originalFileUrl || null,
    file_scan_json: data.fileScan || null,
    upload_sha256: data.uploadSha256 || null,
  };

  const { data: row, error } = await supabase
    .from('orders')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return normalizeOrder(row);
}

export async function updateOrder(id, patch) {
  const supabase = getSupabaseAdmin();
  const updates = {};

  if ('status' in patch) updates.status = patch.status;
  if ('deliveryStatus' in patch) updates.delivery_status = patch.deliveryStatus;
  if ('result' in patch) updates.result_json = patch.result;
  if ('failureReason' in patch) updates.failure_reason = patch.failureReason;
  if ('stripeCheckoutSessionId' in patch) updates.stripe_checkout_session_id = patch.stripeCheckoutSessionId;
  if ('originalFileUrl' in patch) updates.original_file_url = patch.originalFileUrl;
  if ('fileScan' in patch) updates.file_scan_json = patch.fileScan;
  if ('uploadSha256' in patch) updates.upload_sha256 = patch.uploadSha256;
  if ('generatedFiles' in patch) updates.generated_files_json = patch.generatedFiles;
  if ('processingStartedAt' in patch) updates.processing_started_at = patch.processingStartedAt;
  if ('completedAt' in patch) updates.completed_at = patch.completedAt;
  if ('emailMessageId' in patch) updates.email_message_id = patch.emailMessageId;

  const { data: row, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return normalizeOrder(row);
}

export async function markOrderProcessingIfEligible(id) {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data: row, error } = await supabase
    .from('orders')
    .update({ status: 'processing', processing_started_at: now })
    .eq('id', id)
    .in('status', ['paid', 'retryable'])
    .select()
    .maybeSingle();

  if (error) throw error;
  return normalizeOrder(row);
}

export async function getOrder(id) {
  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return normalizeOrder(row);
}

export async function getOrderByAccessToken(accessToken) {
  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('orders').select('*').eq('access_token', accessToken).maybeSingle();
  if (error) throw error;
  return normalizeOrder(row);
}

export async function getOrderByStripeSessionId(sessionId) {
  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_checkout_session_id', sessionId)
    .maybeSingle();
  if (error) throw error;
  return normalizeOrder(row);
}

export async function listOrders() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeOrder);
}

export async function listPendingPaidOrders(limit = 10) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .in('status', ['paid', 'retryable'])
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(normalizeOrder);
}

export function getPublicOrder(order) {
  if (!order) return null;
  return {
    id: order.id,
    accessToken: order.accessToken,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    completedAt: order.completedAt,
    status: order.status,
    deliveryStatus: order.deliveryStatus,
    plan: order.plan,
    amountAed: order.amountAed,
    fullName: order.fullName,
    email: order.email,
    targetRole: order.targetRole,
    targetCountry: order.targetCountry,
    originalFileName: order.originalFileName,
    result: order.result || null,
    failureReason: order.failureReason || null,
    generatedFiles: order.generatedFiles || {},
    fileScan: order.fileScan || null,
    uploadSha256: order.uploadSha256 || null,
  };
}

export async function getAdminSummary() {
  const orders = await listOrders();
  const summary = {
    totalOrders: orders.length,
    totalRevenueAed: orders
      .filter((order) => ['paid', 'processing', 'completed'].includes(order.status))
      .reduce((sum, order) => sum + (Number(order.amountAed) || 0), 0),
    completedOrders: orders.filter((order) => order.status === 'completed').length,
    processingOrders: orders.filter((order) => ['paid', 'processing', 'retryable'].includes(order.status)).length,
    failedOrders: orders.filter((order) => ['failed', 'retryable'].includes(order.status)).length,
  };
  return { summary, orders };
}

export async function uploadOriginalResume(fileOrBuffer, orderId, options = {}) {
  const supabase = getSupabaseAdmin();
  const bucket = getUploadsBucket();
  const ext = (options.fileName || fileOrBuffer?.name || '').split('.').pop()?.toLowerCase() || 'bin';
  const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'bin';
  const filePath = `${orderId}/resume.${safeExt}`;
  const arrayBuffer = Buffer.isBuffer(fileOrBuffer) ? fileOrBuffer : Buffer.from(await fileOrBuffer.arrayBuffer());
  const { error } = await supabase.storage.from(bucket).upload(filePath, arrayBuffer, {
    contentType: options.contentType || fileOrBuffer?.type || 'application/octet-stream',
    upsert: true,
  });
  if (error) throw error;

  return { filePath };
}

export async function createOriginalResumeSignedUrl(filePath, expiresInSeconds = 60 * 15) {
  const supabase = getSupabaseAdmin();
  const bucket = getUploadsBucket();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
