import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { getOrder, getOrderByStripeSessionId, updateOrder } from '@/lib/orders';
import { enqueueOrderFulfillment } from '@/lib/queue';
import { captureAppError } from '@/lib/error-tracking';
import { createAuditLog } from '@/lib/audit';

export const runtime = 'nodejs';

export async function POST(request) {
  if (process.env.MOCK_MODE === 'true') {
    return new Response('Mock mode enabled', { status: 200 });
  }

  const stripe = getStripe();
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    await captureAppError(error, { source: 'stripe.webhook.signature' }).catch(() => null);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    let order = null;

    if (session.metadata?.orderId) {
      order = await getOrder(session.metadata.orderId);
    }
    if (!order && session.id) {
      order = await getOrderByStripeSessionId(session.id);
    }

    if (order && !['completed', 'processing'].includes(order.status)) {
      await updateOrder(order.id, { status: 'paid', stripeCheckoutSessionId: session.id, failureReason: null });
      await createAuditLog({ action: 'payment.completed', targetType: 'order', targetId: order.id, metadata: { stripeSessionId: session.id } }).catch(() => null);
      await enqueueOrderFulfillment(order.id).catch((error) => captureAppError(error, { source: 'stripe.webhook.enqueue', orderId: order.id }));
    }
  }

  return new Response('ok', { status: 200 });
}
