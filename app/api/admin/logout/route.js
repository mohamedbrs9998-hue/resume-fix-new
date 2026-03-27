import { NextResponse } from 'next/server';
import { destroyAdminSession, getAdminSession } from '@/lib/admin';
import { createAuditLog } from '@/lib/audit';

export const runtime = 'nodejs';

export async function POST(request) {
  const session = await getAdminSession().catch(() => null);
  if (session?.email) {
    await createAuditLog({ actorEmail: session.email, action: 'admin.logout', targetType: 'admin_user', targetId: session.sub }).catch(() => null);
  }
  await destroyAdminSession();
  return NextResponse.redirect(new URL('/admin/login', request.url));
}
