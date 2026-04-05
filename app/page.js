import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PlanCard from '@/components/PlanCard';
import { plans } from '@/lib/pricing';

export default function HomePage() {
  return (
    <main>
      <Navbar />

      <section className="container hero">
        <div className="hero-card">
          <div className="badge">Upload → Pay → Receive instantly</div>
          <h1>Automatic CV rewriting that sells itself in one page.</h1>
          <p className="lead">
            Visitors upload a resume, pay online, and receive an AI-generated career package with an improved CV,
            ATS report, cover letter, and LinkedIn summary.
          </p>
          <div className="actions">
            <Link href="/upload" className="btn btn-primary">Start My CV Rewrite</Link>
            <Link href="/pricing" className="btn btn-secondary">See pricing</Link>
          </div>
        </div>

        <div className="card kpi">
          <div>
            <div className="small">AUTOMATION FLOW</div>
            <strong>100%</strong>
            <div className="muted">Upload file → pay via Stripe → AI processes → private result page + downloads delivered.</div>
          </div>
          <div>
            <div className="small">AVERAGE TARGET</div>
            <strong>2-3 orders/day</strong>
            <div className="muted">Enough to move toward several thousand AED monthly depending on pricing and conversion.</div>
          </div>
          <div>
            <div className="small">BEST FOR</div>
            <strong>Job seekers</strong>
            <div className="muted">Especially Gulf job seekers wanting a stronger ATS-ready CV package fast.</div>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="grid-3">
          <div className="card">
            <h3>1. Upload</h3>
            <p className="muted">The customer uploads a PDF, DOCX, or TXT resume and provides the target role.</p>
          </div>
          <div className="card">
            <h3>2. Pay</h3>
            <p className="muted">The site creates a Stripe Checkout session and handles the payment flow automatically.</p>
          </div>
          <div className="card">
            <h3>3. Receive</h3>
            <p className="muted">After payment, the resume is processed and the result is shown on a success page.</p>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2>Pricing</h2>
        <div className="grid-3">
          <PlanCard plan={plans.basic} />
          <PlanCard plan={plans.pro} highlight />
          <PlanCard plan={plans.premium} />
        </div>
      </section>

      <section className="container section">
        <div className="grid-2">
          <div className="card">
            <h3>What the buyer receives</h3>
            <ul className="list" style={{ marginTop: 18 }}>
              <li>Improved resume copy</li>
              <li>Cover letter draft</li>
              <li>ATS improvement report</li>
              <li>LinkedIn About section</li>
              <li>Next-step recommendations</li>
            </ul>
          </div>
          <div className="card">
            <h3>What makes this fast to launch</h3>
            <ul className="list" style={{ marginTop: 18 }}>
              <li>One product, one audience, one conversion path</li>
              <li>No inventory or shipping</li>
              <li>Stripe-hosted payment page</li>
              <li>AI-generated output after purchase</li>
              <li>Can be upgraded later to subscriptions or credits</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
