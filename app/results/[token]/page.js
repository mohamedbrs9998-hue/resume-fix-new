import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getOrderByAccessToken } from '@/lib/orders';

const downloadOptions = [
  { key: 'pdf', label: 'PDF Package' },
  { key: 'docx', label: 'DOCX Package' },
  { key: 'txt', label: 'Text Package' },
  { key: 'json', label: 'ATS JSON' },
];

export default async function ResultPage({ params }) {
  const resolvedParams = await params;
  const order = await getOrderByAccessToken(resolvedParams.token);

  if (!order) {
    return (
      <main>
        <Navbar />
        <section className="container section">
          <div className="card">
            <div className="badge">Private result link</div>
            <h2>Result not found.</h2>
            <p className="muted">The access link may be invalid or the result has not been created.</p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <section className="container section">
        <div className="grid-2">
          <div className="card">
            <div className="badge">Private result link</div>
            <h2>{order.fullName}&apos;s result package</h2>
            <p className="muted">Save this page URL. It is the private customer access page for this order.</p>
            <div className={`status-pill ${order.status === 'completed' ? 'status-completed' : order.status === 'failed' || order.status === 'retryable' ? 'status-failed' : 'status-processing'}`}>{order.status}</div>
            <ul className="list" style={{ marginTop: 16 }}>
              <li><strong>Plan:</strong> {order.plan}</li>
              <li><strong>Target role:</strong> {order.targetRole}</li>
              <li><strong>Target country:</strong> {order.targetCountry}</li>
              <li><strong>Email:</strong> {order.email}</li>
            </ul>
            {order.generatedFiles && Object.keys(order.generatedFiles).length > 0 ? (
              <div className="downloads-grid" style={{ marginTop: 18 }}>
                {downloadOptions.filter((item) => order.generatedFiles[item.key]).map((item) => (
                  <a key={item.key} className="btn btn-secondary" href={`/api/results/${order.accessToken}/download?file=${item.key}`}>
                    Download {item.label}
                  </a>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ marginTop: 16 }}>The result is not ready yet. Return later or keep refreshing this page.</p>
            )}
          </div>

          <div className="card">
            <h3>Generated result</h3>
            {!order.result ? (
              <p className="muted">No generated output is available yet.</p>
            ) : (
              <div className="form">
                <div>
                  <div className="small">Resume title</div>
                  <div>{order.result.resume_title}</div>
                </div>
                <div>
                  <div className="small">Improved resume</div>
                  <div className="code-box">{order.result.improved_resume}</div>
                </div>
                <div>
                  <div className="small">Cover letter</div>
                  <div className="code-box">{order.result.cover_letter}</div>
                </div>
                <div>
                  <div className="small">LinkedIn summary</div>
                  <div className="code-box">{order.result.linkedin_summary}</div>
                </div>
                <div>
                  <div className="small">ATS report</div>
                  <div className="code-box">{JSON.stringify(order.result.ats_report, null, 2)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
