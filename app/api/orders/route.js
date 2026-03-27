import { NextResponse } from 'next/server';
import { getAdminSummary } from '@/lib/orders';
import { isAdminAuthorized } from '@/lib/admin';

export const runtime = 'nodejs';

export async function GET(request) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { summary, orders } = await getAdminSummary();
  return NextResponse.json({
    summary,
    orders: orders.map((order) => ({
      id: order.id,
      accessToken: order.accessToken,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      fullName: order.fullName,
      email: order.email,
      plan: order.plan,
      amountAed: order.amountAed,
      status: order.status,
      deliveryStatus: order.deliveryStatus,
      targetRole: order.targetRole,
      targetCountry: order.targetCountry,
      originalFileUrl: order.originalFileUrl,
    })),
  });
}
