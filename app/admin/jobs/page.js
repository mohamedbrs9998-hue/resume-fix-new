import Link from 'next/link';
import { requireAdminSession } from '@/lib/admin';
import { listQueueJobs } from '@/lib/queue';

export default async function AdminJobsPage() {
  await requireAdminSession();
  const jobs = await listQueueJobs(200);

  return (
    <main className="container section">
      <div className="admin-topbar">
        <div>
          <div className="badge">QUEUE HEALTH</div>
          <h1 style={{ marginTop: 18 }}>Background jobs</h1>
          <p className="muted">Retry failed jobs or inspect retries and timing.</p>
        </div>
        <Link className="btn btn-secondary" href="/admin">Back to dashboard</Link>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Created</th>
                <th>Type</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{new Date(job.created_at).toLocaleString()}</td>
                  <td>{job.type}</td>
                  <td>
                    <div>{job.status}</div>
                    {job.last_error ? <div className="small">{job.last_error}</div> : null}
                  </td>
                  <td>{job.attempts || 0}</td>
                  <td>{job.order_id || '—'}</td>
                  <td>
                    <form action="/api/admin/jobs/requeue" method="POST">
                      <input type="hidden" name="queueJobId" value={job.id} />
                      <button className="btn btn-secondary" type="submit">Requeue</button>
                    </form>
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
