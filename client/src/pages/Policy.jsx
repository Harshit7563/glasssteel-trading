import { Link, useOutletContext, useParams } from "react-router-dom";
import { policies, policyLinks } from "../data/policies";

function RichBlock({ block }) {
  return (
    <>
      {block.body ? <p>{block.body}</p> : null}
      {block.list ? (
        <ul className="policy-list">
          {block.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {block.table ? (
        <div className="policy-table-wrap">
          <table className="policy-table">
            <thead>
              <tr>
                {block.table.headers.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell, i) => (
                    <td key={`${i}-${cell.slice(0, 24)}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {block.paragraphs?.map((para) => (
        <p key={para.slice(0, 64)}>{para}</p>
      ))}
      {block.note ? <p className="policy-note">{block.note}</p> : null}
    </>
  );
}

function SectionBody({ section }) {
  return (
    <>
      <RichBlock block={section} />
      {section.subsections?.map((sub) => (
        <div key={sub.heading} className="policy-sub">
          <h3>{sub.heading}</h3>
          <RichBlock block={sub} />
        </div>
      ))}
    </>
  );
}

export default function Policy() {
  const { slug } = useParams();
  const { company } = useOutletContext() || {};
  const policy = policies[slug];

  const email = company?.email || "sales@glassteel.in";
  const phone = company?.phone || "+91 98765 43210";
  const address = [company?.address, company?.city].filter(Boolean).join(", ") ||
    "Industrial Area, Sector Trade Hub, India";

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
        {policy.effective ? <p>Effective date: {policy.effective}</p> : null}
        <p>Last updated: {policy.updated}</p>
        {policy.website ? (
          <p>
            Website:{" "}
            <a href={policy.website} target="_blank" rel="noreferrer">
              {policy.website}
            </a>
          </p>
        ) : null}
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
          {policy.intro?.map((para) => (
            <p key={para.slice(0, 48)} className="policy-intro">
              {para}
            </p>
          ))}

          {policy.sections.map((s) => (
            <div key={s.heading} className="policy-block">
              <h2>{s.heading}</h2>
              <SectionBody section={s} />
            </div>
          ))}

          {slug === "privacy-policy" ? (
            <div className="policy-block">
              <h2>Privacy contact details</h2>
              <p>
                <strong>Company:</strong>{" "}
                {company?.legal_name ||
                  "GLASSTEEL TRADING (OPC) PRIVATE LIMITED"}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${email}`}>{email}</a>
              </p>
              <p>
                <strong>Telephone:</strong> {phone}
              </p>
              <p>
                <strong>Postal / registered office:</strong> {address}
              </p>
            </div>
          ) : null}

          <p className="policy-contact">
            Questions?{" "}
            <Link to="/contact">Contact GLASSTEEL support</Link> or email{" "}
            <a href={`mailto:${email}`}>{email}</a>
          </p>
        </article>
      </div>
    </section>
  );
}
