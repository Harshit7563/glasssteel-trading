import { Link, useOutletContext } from "react-router-dom";

export default function About() {
  const { company } = useOutletContext();

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container page-hero">
        <span className="eyebrow">Company</span>
        <h1>Built for trade.</h1>
        <p>
          {company?.legal_name ||
            "GLASSTEEL TRADING (OPC) PRIVATE LIMITED"}{" "}
          supplies materials for projects that need steel strength and glass
          character.
        </p>
      </div>

      <div className="container split">
        <div className="about-copy">
          <p>
            {company?.about ||
              "We work with contractors, designers, and homeowners who need durable finishes, clear specifications, and reliable delivery."}
          </p>
          <p>
            Our focus spans three ranges: building interiors for commercial
            spaces, home interiors for residential detailing, and steel with
            antique glass for façades, lobbies, and feature work.
          </p>
          <p>
            Tell us the opening sizes, finish, and timeline — we help match the
            right material and move it to site.
          </p>
          <div className="cta-row">
            <Link className="btn btn-dark" to="/contact">
              Start an enquiry
            </Link>
            <Link className="btn btn-outline" to="/products">
              Browse catalogue
            </Link>
          </div>
        </div>
        <div className="about-panel" aria-hidden="true" />
      </div>
    </section>
  );
}
