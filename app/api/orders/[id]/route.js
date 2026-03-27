import { NextResponse } from 'next/server';
import { getOrder, getPublicOrder, updateOrder } from '@/lib/orders';
import { fulfillOrder } from '@/lib/fulfillment';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const order = await getOrder(resolvedParams.id);

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (process.env.MOCK_MODE === 'true' && order.status === 'pending_payment') {
    await updateOrder(order.id, { status: 'paid' });
  }

  if (['paid', 'retryable'].includes(order.status) && process.env.MOCK_MODE === 'true') {
    const finalOrder = await fulfillOrder(order.id);
    return NextResponse.json({ order: getPublicOrder(finalOrder) });
  }

  return NextResponse.json({ order: getPublicOrder(order) });
}
