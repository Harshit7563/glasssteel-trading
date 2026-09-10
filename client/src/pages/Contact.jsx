import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { api } from "../api";
import EscrowBank from "../components/EscrowBank";

const initial = {
  name: "",
  email: "",
  phone: "",
  company: "",
  category: "",
  message: "",
};

export default function Contact() {
  const { company } = useOutletContext();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const preset = searchParams.get("category");
    if (preset) {
      setForm((f) => ({ ...f, category: preset }));
    }
  }, [searchParams]);

  function update(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSending(true);
    setStatus({ type: "", text: "" });
    try {
      await api.submitInquiry(form);
      setForm(initial);
      setStatus({
        type: "ok",
        text: "Enquiry received. Our team will respond shortly.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        text: err.message || "Could not send enquiry.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container page-hero">
        <span className="eyebrow">Contact</span>
        <h1>Request a quote.</h1>
        <p>
          Share project details for building interiors, home interiors, or steel
          and antique glass supply.
        </p>
      </div>

      <div className="container split">
        <form className="contact-form" onSubmit={onSubmit}>
          <div className="form-row">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={update}
                required
                autoComplete="name"
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={update}
                autoComplete="tel"
              />
            </div>
            <div className="field">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                name="company"
                value={form.company}
                onChange={update}
                autoComplete="organization"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="category">Interest</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={update}
            >
              <option value="">Select a range</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={update}
              required
              placeholder="Sizes, finishes, quantity, timeline…"
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={sending}>
            {sending ? "Sending…" : "Send enquiry"}
          </button>

          {status.text ? (
            <p
              className={`form-status${status.type === "error" ? " error" : ""}`}
              role="status"
            >
              {status.text}
            </p>
          ) : null}
        </form>

        <aside className="contact-aside">
          <div>
            <h3>Sales</h3>
            <p>{company?.email || "sales@glassteel.in"}</p>
            <p>{company?.phone || "+91 98765 43210"}</p>
          </div>
          <div>
            <h3>Location</h3>
            <p>{company?.address || "Industrial Area, Sector Trade Hub"}</p>
            <p>{company?.city || "India"}</p>
          </div>
          <div>
            <h3>Legal name</h3>
            <p>
              {company?.legal_name ||
                "GLASSTEEL TRADING (OPC) PRIVATE LIMITED"}
            </p>
          </div>
          <EscrowBank company={company} />
        </aside>
      </div>
    </section>
  );
}
