'use client';
export const dynamic = "force-dynamic";
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { plans } from '@/lib/pricing';

export default function UploadPage() {
  const params = useSearchParams();
  const initialPlan = params.get('plan') || 'pro';
  const [selectedPlan, setSelectedPlan] = useState(plans[initialPlan] ? initialPlan : 'pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plan = useMemo(() => plans[selectedPlan], [selectedPlan]);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not create checkout session');
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <main>
      <Navbar />
      <section className="container section">
        <div className="grid-2">
          <div className="card">
            <div className="badge">Place an automated order</div>
            <h2>Upload the CV and launch checkout.</h2>
            <p className="muted">The customer file is processed after payment. In production, connect cloud storage and email delivery for a stronger live experience.</p>
            <ul className="list" style={{ marginTop: 18 }}>
              <li>Accepted files: PDF, DOCX, TXT</li>
              <li>Currency: AED</li>
              <li>Plan selected: {plan.name}</li>
            </ul>
          </div>

          <div className="card">
            <form className="form" onSubmit={onSubmit}>
              <div className="form-row">
                <label>
                  Full name
                  <input name="fullName" placeholder="Mohammed Ezzeldin" required />
                </label>
                <label>
                  Email
                  <input type="email" name="email" placeholder="name@example.com" required />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Target role
                  <input name="targetRole" placeholder="Pediatric Resident / Project Coordinator / Sales Executive" required />
                </label>
                <label>
                  Target market
                  <input name="targetCountry" placeholder="UAE / Saudi Arabia / Qatar / Remote" required />
                </label>
              </div>

              <label>
                Package
                <select name="plan" value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
                  {Object.values(plans).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — AED {item.priceAed}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Upload CV
                <input type="file" name="resume" accept=".pdf,.docx,.txt" required />
              </label>

              <label>
                Optional job description
                <textarea name="jobDescription" rows="5" placeholder="Paste a target job description to improve keyword matching." />
              </label>

              {error ? <div className="small" style={{ color: '#ffd0d0' }}>{error}</div> : null}

              <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                {loading ? 'Redirecting to checkout…' : `Continue to payment — AED ${plan.priceAed}`}
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
