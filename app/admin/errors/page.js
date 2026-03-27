import Link from 'next/link';
import { requireAdminSession } from '@/lib/admin';
import { listErrorEvents } from '@/lib/error-tracking';

export default async function AdminErrorsPage() {
  await requireAdminSession();
  const errors = await listErrorEvents(200);

  return (
    <main className="container section">
      <div className="admin-topbar">
        <div>
          <div className="badge">ERROR MONITORING</div>
          <h1 style={{ marginTop: 18 }}>Application error log</h1>
        </div>
        <Link className="btn btn-secondary" href="/admin">Back to dashboard</Link>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Source</th>
                <th>Severity</th>
                <th>Message</th>
                <th>Links</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                  <td>{item.source}</td>
                  <td>{item.severity}</td>
                  <td>
                    <div>{item.message}</div>
                    {item.stack ? <details className="small" style={{ marginTop: 8 }}><summary>Stack</summary><pre className="code-box">{item.stack}</pre></details> : null}
                  </td>
                  <td>
                    <div className="small">Order: {item.order_id || '—'}</div>
                    <div className="small">Job: {item.queue_job_id || '—'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
