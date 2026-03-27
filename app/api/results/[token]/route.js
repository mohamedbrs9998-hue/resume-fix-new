import { NextResponse } from 'next/server';
import { getOrderByAccessToken, getPublicOrder } from '@/lib/orders';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const order = await getOrderByAccessToken(resolvedParams.token);

  if (!order) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  }

  return NextResponse.json({ order: getPublicOrder(order) });
}
