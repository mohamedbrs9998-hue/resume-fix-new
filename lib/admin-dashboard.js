import { createOriginalResumeSignedUrl, getAdminSummary } from '@/lib/orders';
import { listErrorEvents } from '@/lib/error-tracking';
import { listQueueJobs } from '@/lib/queue';
import { listAuditLogs } from '@/lib/audit';

export async function getDashboardData() {
  const { summary, orders } = await getAdminSummary();
  const [errors, jobs, auditLogs] = await Promise.all([
    listErrorEvents(20),
    listQueueJobs(20),
    listAuditLogs(20),
  ]);

  const hydratedOrders = await Promise.all(
    orders.slice(0, 20).map(async (order) => ({
      ...order,
      originalFileSignedUrl: order.originalFilePath ? await createOriginalResumeSignedUrl(order.originalFilePath).catch(() => null) : null,
    }))
  );

  return {
    summary,
    orders: hydratedOrders,
    errors,
    jobs,
    auditLogs,
  };
}
