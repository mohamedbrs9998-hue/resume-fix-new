import { NextResponse } from 'next/server';
import { authenticateAdmin, createAdminSession } from '@/lib/admin';
import { createAuditLog } from '@/lib/audit';

export const runtime = 'nodejs';

export async function POST(request) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const nextUrl = String(formData.get('next') || '/admin');

  const user = await authenticateAdmin(email, password);
  if (!user) {
    return NextResponse.redirect(new URL(`/admin/login?error=${encodeURIComponent('Invalid email or password')}`, request.url));
  }

  await createAdminSession(user);
  await createAuditLog({ actorEmail: user.email, action: 'admin.login', targetType: 'admin_user', targetId: user.id });
  return NextResponse.redirect(new URL(nextUrl.startsWith('/admin') ? nextUrl : '/admin', request.url));
}
