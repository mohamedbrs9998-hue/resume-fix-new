import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LegalPage() {
  return (
    <main>
      <Navbar />
      <section className="container section">
        <div className="card">
          <div className="badge">Legal</div>
          <h2>Terms and privacy</h2>
          <p className="muted">
            This website provides automated writing assistance for resumes and job application content. Results are
            generated automatically and should be reviewed by the customer before submission.
          </p>
          <div className="form" style={{ marginTop: 18 }}>
            <div>
              <h3>Privacy</h3>
              <p className="muted">Uploaded files and submitted data are processed to generate the purchased output. Do not upload highly sensitive information unless your production storage and security controls are fully configured.</p>
            </div>
            <div>
              <h3>No hiring guarantee</h3>
              <p className="muted">Using this service does not guarantee interviews, offers, visas, licensing approvals, or employment outcomes.</p>
            </div>
            <div>
              <h3>Refund policy</h3>
              <p className="muted">You can define a no-refund or limited-refund policy depending on your jurisdiction and Stripe account configuration. Review local laws before going live.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
