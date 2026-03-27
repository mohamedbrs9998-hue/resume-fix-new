import { getOrder, markOrderProcessingIfEligible, updateOrder } from '@/lib/orders';
import { processResumeOrder } from '@/lib/processor';
import { sendCompletionEmail } from '@/lib/email';
import { createResultArtifacts } from '@/lib/result-files';
import { captureAppError } from '@/lib/error-tracking';
import { createAuditLog } from '@/lib/audit';

export async function fulfillOrder(orderId) {
  const current = await getOrder(orderId);
  if (!current) {
    throw new Error('Order not found');
  }

  if (current.status === 'completed') {
    return current;
  }

  let activeOrder = current;
  if (current.status !== 'processing') {
    const claimed = await markOrderProcessingIfEligible(orderId);
    if (!claimed && process.env.MOCK_MODE !== 'true') {
      return await getOrder(orderId);
    }
    activeOrder = claimed || current;
  }

  try {
    const latest = await getOrder(orderId);
    const result = await processResumeOrder(latest);
    const artifacts = await createResultArtifacts({ ...latest, result });
    const completed = await updateOrder(orderId, {
      status: 'completed',
      deliveryStatus: 'ready',
      result,
      generatedFiles: artifacts,
      completedAt: new Date().toISOString(),
      failureReason: null,
    });

    await createAuditLog({ action: 'order.completed', targetType: 'order', targetId: orderId, metadata: { email: latest.email } }).catch(() => null);

    try {
      const emailResult = await sendCompletionEmail(completed);
      return await updateOrder(orderId, {
        deliveryStatus: 'sent',
        emailMessageId: emailResult?.id || null,
      });
    } catch (emailError) {
      await captureAppError(emailError, { source: 'email.delivery', orderId }).catch(() => null);
      return await updateOrder(orderId, { deliveryStatus: `email_failed: ${emailError.message}` });
    }
  } catch (error) {
    await captureAppError(error, { source: 'fulfillment', orderId, context: { activeStatus: activeOrder.status } }).catch(() => null);
    return await updateOrder(orderId, {
      status: 'retryable',
      failureReason: error.message,
      deliveryStatus: 'failed',
    });
  }
}
