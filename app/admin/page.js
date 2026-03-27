import Link from 'next/link';
import { requireAdminSession } from '@/lib/admin';
import { getDashboardData } from '@/lib/admin-dashboard';

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const data = await getDashboardData();

  return (
    <main className="container section">
      <div className="admin-topbar">
        <div>
          <div className="badge">CONTROL PANEL</div>
          <h1 style={{ marginTop: 18 }}>Welcome back, {session.email}</h1>
          <p className="muted">Track revenue, queue health, and operational issues from one place.</p>
        </div>
        <div className="admin-actions">
          <Link className="btn btn-secondary" href="/admin/errors">Errors</Link>
          <Link className="btn btn-secondary" href="/admin/jobs">Queue jobs</Link>
          <form action="/api/admin/logout" method="POST">
            <button className="btn btn-primary" type="submit">Sign out</button>
          </form>
        </div>
      </div>

      <section className="stats-grid" style={{ marginTop: 24 }}>
        <div className="card"><div className="small">TOTAL ORDERS</div><div className="price">{data.summary.totalOrders}</div></div>
        <div className="card"><div className="small">REVENUE</div><div className="price">AED {data.summary.totalRevenueAed}</div></div>
        <div className="card"><div className="small">COMPLETED</div><div className="price">{data.summary.completedOrders}</div></div>
        <div className="card"><div className="small">IN FLIGHT</div><div className="price">{data.summary.processingOrders}</div></div>
      </section>

      <section className="grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="section-title-row">
            <h3>Recent orders</h3>
            <Link className="small" href="/admin/jobs">See jobs</Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Delivery</th>
                  <th>Files</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div>{order.fullName}</div>
                      <div className="small">{order.email}</div>
                    </td>
                    <td>{order.plan}</td>
                    <td>{order.status}</td>
                    <td>{order.deliveryStatus}</td>
                    <td>
                      <div style={{ display: 'grid', gap: 6 }}>
                        <Link href={`/results/${order.accessToken}`} className="small">Result page</Link>
                        {order.originalFileSignedUrl ? <a href={order.originalFileSignedUrl} className="small" target="_blank">Original CV</a> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="section-title-row">
            <h3>Latest error events</h3>
            <Link className="small" href="/admin/errors">Open all</Link>
          </div>
          <div className="stack-list">
            {data.errors.length === 0 ? <div className="small">No errors logged.</div> : data.errors.slice(0, 8).map((item) => (
              <div key={item.id} className="stack-item">
                <div className="small">{item.source} · {item.severity}</div>
                <div>{item.message}</div>
                <div className="small">{new Date(item.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="section-title-row">
            <h3>Queue jobs</h3>
            <Link className="small" href="/admin/jobs">Open queue</Link>
          </div>
          <div className="stack-list">
            {data.jobs.length === 0 ? <div className="small">No queue jobs yet.</div> : data.jobs.slice(0, 8).map((job) => (
              <div key={job.id} className="stack-item">
                <div className="small">{job.type} · {job.status}</div>
                <div>Order: {job.order_id || '—'}</div>
                <div className="small">Attempts: {job.attempts || 0}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Audit trail</h3>
          <div className="stack-list">
            {data.auditLogs.length === 0 ? <div className="small">No audit entries yet.</div> : data.auditLogs.slice(0, 8).map((item) => (
              <div key={item.id} className="stack-item">
                <div>{item.action}</div>
                <div className="small">{item.actor_email || 'system'} · {new Date(item.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
