import Link from 'next/link';

export default function PlanCard({ plan, highlight = false }) {
  return (
    <div className={`card ${highlight ? 'highlight' : ''}`}>
      <div className="plan-top">
        <div>
          <div className="badge">{plan.name}</div>
          <h3>{plan.title}</h3>
        </div>
        {highlight ? <div className="small">Most popular</div> : null}
      </div>
      <div className="price">AED {plan.priceAed}</div>
      <p className="muted">{plan.description}</p>
      <ul className="list" style={{ marginTop: 18 }}>
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <div className="actions">
        <Link className="btn btn-primary btn-full" href={`/upload?plan=${plan.id}`}>
          Choose {plan.name}
        </Link>
      </div>
    </div>
  );
}
