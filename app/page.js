import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-left">
          <div className="hero-badge">Upload → Pay → Receive instantly</div>

          <h1 className="hero-title">
            Automatic CV rewriting that sells itself in one page.
          </h1>

          <p className="hero-text">
            Visitors upload a resume, pay online, and receive an AI-generated
            career package with an improved CV, ATS report, cover letter, and
            LinkedIn summary.
          </p>

          <div className="hero-actions">
            <Link href="/resume-rewrite" className="btn btn-primary">
              Start My CV Rewrite
            </Link>

            <Link href="/pricing" className="btn btn-secondary">
              See pricing
            </Link>
          </div>
        </div>

        <div className="hero-right card">
          <div className="stat-block">
            <div className="stat-label">AUTOMATION FLOW</div>
            <div className="stat-value">100%</div>
            <p className="stat-text">
              Upload file → pay → AI process → result preview + downloads
              delivered.
            </p>
          </div>

          <div className="stat-block">
            <div className="stat-label">AVERAGE TARGET</div>
            <div className="stat-value">2-3 orders/day</div>
            <p className="stat-text">
              Enough to move toward several thousand AED monthly depending on
              pricing and conversion.
            </p>
          </div>

          <div className="stat-block">
            <div className="stat-label">BEST FOR</div>
            <div className="stat-value">Job seekers</div>
            <p className="stat-text">
              Especially Gulf job seekers wanting a stronger ATS-ready CV
              package fast.
            </p>
          </div>
        </div>
      </section>

      <section className="steps-grid">
        <div className="card step-card">
          <h3>1. Upload</h3>
          <p>
            The customer uploads a PDF, DOCX, or TXT resume and provides the
            target role.
          </p>
        </div>

        <div className="card step-card">
          <h3>2. Pay</h3>
          <p>
            The site creates a checkout flow and handles the payment process
            securely.
          </p>
        </div>

        <div className="card step-card">
          <h3>3. Receive</h3>
          <p>
            After payment, the resume is processed and the result is shown on a
            clean result page.
          </p>
        </div>
      </section>

      <style jsx>{`
        .page-shell {
          min-height: 100vh;
          padding: 40px 24px 72px;
          color: #f8fafc;
          background:
            radial-gradient(
              circle at top left,
              rgba(59, 130, 246, 0.16),
              transparent 28%
            ),
            linear-gradient(180deg, #0b1220 0%, #081018 100%);
        }

        .hero {
          max-width: 1200px;
          margin: 0 auto 28px;
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
        }

        .hero-left,
        .hero-right,
        .step-card {
          border-radius: 28px;
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: rgba(15, 23, 42, 0.88);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
        }

        .hero-left {
          padding: 28px;
        }

        .hero-right {
          padding: 24px;
        }

        .hero-badge {
          display: inline-block;
          margin-bottom: 18px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(96, 165, 250, 0.14);
          color: #dbeafe;
          font-size: 14px;
          font-weight: 700;
        }

        .hero-title {
          margin: 0 0 18px;
          font-size: clamp(42px, 7vw, 78px);
          line-height: 0.95;
          letter-spacing: -0.04em;
          font-weight: 800;
        }

        .hero-text {
          margin: 0;
          max-width: 760px;
          color: #dbe4f0;
          font-size: clamp(18px, 2vw, 22px);
          line-height: 1.7;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 28px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 190px;
          padding: 16px 24px;
          border-radius: 18px;
          text-decoration: none;
          font-weight: 800;
          font-size: 18px;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          opacity: 0.96;
        }

        .btn-primary {
          background: linear-gradient(135deg, #7dd3fc 0%, #60a5fa 100%);
          color: #081018;
        }

        .btn-secondary {
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(15, 23, 42, 0.66);
          color: #f8fafc;
        }

        .stat-block + .stat-block {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid rgba(148, 163, 184, 0.12);
        }

        .stat-label {
          color: #94a3b8;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 8px;
        }

        .stat-text {
          margin: 0;
          color: #dbe4f0;
          line-height: 1.6;
          font-size: 15px;
        }

        .steps-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .step-card {
          padding: 24px;
        }

        .step-card h3 {
          margin: 0 0 12px;
          font-size: 32px;
          font-weight: 800;
        }

        .step-card p {
          margin: 0;
          color: #dbe4f0;
          line-height: 1.7;
          font-size: 18px;
        }

        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .steps-grid {
            grid-template-columns: 1fr;
          }

          .hero-left,
          .hero-right,
          .step-card {
            border-radius: 22px;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
