import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth";

export default function Login() {
  const { login, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && isLoggedIn) {
    return <Navigate to={redirect} replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate(redirect);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section auth-section" style={{ paddingTop: 0 }}>
      <div className="container auth-shell">
        <div className="auth-card">
          <span className="eyebrow">Account</span>
          <h1>Login</h1>
          <p className="auth-lead">
            Sign in to GLASSTEEL for faster checkout and order updates.
          </p>

          <form className="contact-form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required
              />
            </div>

            {error ? <p className="form-status error">{error}</p> : null}

            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Login"}
            </button>
          </form>

          <p className="auth-switch">
            New here?{" "}
            <Link to={`/register${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
