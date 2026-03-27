import { createClient } from '@supabase/supabase-js';

let adminClient;

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error('Missing Supabase server environment variables');
  }

  if (!adminClient) {
    adminClient = createClient(url, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return adminClient;
}

export function getUploadsBucket() {
  return process.env.SUPABASE_UPLOADS_BUCKET || 'resumes';
}
