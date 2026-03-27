import { getSupabaseAdmin } from '@/lib/supabase';

export async function createAuditLog({
  actorEmail = null,
  action,
  targetType = null,
  targetId = null,
  metadata = {},
}) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('audit_logs').insert({
    actor_email: actorEmail,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata_json: metadata,
  });
  if (error) throw error;
}

export async function listAuditLogs(limit = 100) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
