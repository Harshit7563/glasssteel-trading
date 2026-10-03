import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth";

export default function AdminGuard() {
  const { loading, isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="loading">Checking admin access…</p>
        </div>
      </section>
    );
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
