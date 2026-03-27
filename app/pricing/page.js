import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PlanCard from '@/components/PlanCard';
import { plans } from '@/lib/pricing';

export default function PricingPage() {
  return (
    <main>
      <Navbar />
      <section className="container section">
        <div className="hero-card">
          <div className="badge">Simple pricing</div>
          <h1>Choose the package that matches the result you want.</h1>
          <p className="lead">Start with one-time payments now. Add subscriptions later when you want ongoing credits or premium career tools.</p>
        </div>
      </section>
      <section className="container section">
        <div className="grid-3">
          <PlanCard plan={plans.basic} />
          <PlanCard plan={plans.pro} highlight />
          <PlanCard plan={plans.premium} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
