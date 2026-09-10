import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth";

export default function Register() {
  const { register, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && isLoggedIn) {
    return <Navigate to={redirect} replace />;
  }

  function update(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      navigate(redirect);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section auth-section" style={{ paddingTop: 0 }}>
      <div className="container auth-shell">
        <div className="auth-card">
          <span className="eyebrow">Account</span>
          <h1>Register</h1>
          <p className="auth-lead">
            Create your GLASSTEEL buyer account — free, for contractors & homeowners.
          </p>

          <form className="contact-form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={update}
                required
              />
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={update}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={update}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update}
                  required
                  minLength={6}
                />
              </div>
              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={update}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error ? <p className="form-status error">{error}</p> : null}

            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to={`/login${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
