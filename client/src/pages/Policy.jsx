import { Link, useParams } from "react-router-dom";
import { policies, policyLinks } from "../data/policies";

export default function Policy() {
  const { slug } = useParams();
  const policy = policies[slug];

  if (!policy) {
    return (
      <section className="section">
        <div className="container page-hero">
          <h1>Policy not found</h1>
          <Link className="btn btn-dark" to="/">
            Go home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section policy-section" style={{ paddingTop: 0 }}>
      <div className="container page-hero">
        <span className="eyebrow">Legal</span>
        <h1>{policy.title}</h1>
        <p>Last updated: {policy.updated}</p>
      </div>

      <div className="container policy-layout">
        <aside className="policy-nav">
          <p className="eyebrow">All policies</p>
          {policyLinks.map((p) => (
            <Link
              key={p.slug}
              to={`/policies/${p.slug}`}
              className={p.slug === slug ? "active" : ""}
            >
              {p.title}
            </Link>
          ))}
        </aside>

        <article className="policy-content">
          {policy.sections.map((s) => (
            <div key={s.heading} className="policy-block">
              <h2>{s.heading}</h2>
              <p>{s.body}</p>
            </div>
          ))}
          <p className="policy-contact">
            Questions?{" "}
            <Link to="/contact">Contact GLASSTEEL support</Link> or email
            sales@glassteel.in
          </p>
        </article>
      </div>
    </section>
  );
}
