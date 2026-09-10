import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "./api";
import { useAuth } from "./auth";
import Logo from "./components/Logo";
import { policyLinks } from "./data/policies";

function Header({ categories, cartCount = 0 }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { user, logout, isLoggedIn } = useAuth();

  function onSearch(e) {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
    setOpen(false);
  }

  return (
    <header className="bl-header">
      <div className="bl-header-main container">
        <NavLink to="/" className="bl-logo" onClick={() => setOpen(false)} aria-label="GlassSteel home">
          <Logo />
        </NavLink>

        <button type="button" className="bl-location" onClick={() => navigate("/contact")}>
          <strong>Ship across India</strong>
          <span>Warehouse · Building materials · Change</span>
        </button>

        <form className="bl-search" onSubmit={onSearch}>
          <span aria-hidden="true">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="Search catalogue — steel, glass, decor, facade…"
            aria-label="Search products"
          />
        </form>

        <div className="bl-header-end">
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>

          <div className={`bl-actions${open ? " open" : ""}`}>
            {isLoggedIn ? (
              <>
                <span className="bl-user">Hi {user.name.split(" ")[0]}</span>
                <button
                  type="button"
                  className="bl-login"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className="bl-login" onClick={() => setOpen(false)}>
                Login
              </NavLink>
            )}
            <Link to="/products" className="bl-cart" onClick={() => setOpen(false)}>
              <span>Bag</span>
              {cartCount > 0 ? <em>{cartCount}</em> : null}
            </Link>
          </div>

          <Link to="/products" className="bl-cart bl-cart-mobile" onClick={() => setOpen(false)}>
            <span>Bag</span>
            {cartCount > 0 ? <em>{cartCount}</em> : null}
          </Link>
        </div>
      </div>

      <div className="bl-chip-bar">
        <div className="container bl-chips">
          <Link to="/products" className="bl-chip">
            All
          </Link>
          {(categories || []).map((c) => (
            <Link key={c.slug} to={`/products?category=${c.slug}`} className="bl-chip">
              {c.name}
            </Link>
          ))}
          <Link to="/products?maxPrice=500" className="bl-chip accent">
            Under ₹500
          </Link>
          <Link to="/products?sort=popular" className="bl-chip accent">
            Bestsellers
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer({ company }) {
  return (
    <footer className="bl-footer">
      <div className="container bl-footer-grid">
        <div>
          <Link to="/" className="bl-logo bl-logo-footer" aria-label="GlassSteel home">
            <Logo />
          </Link>
          <p>{company?.legal_name || "GLASSTEEL TRADING (OPC) PRIVATE LIMITED"}</p>
          <p className="muted">Steel · Glass · Decor · Interior · Exterior · GST inclusive</p>
        </div>
        <div>
          <h4>Useful links</h4>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
        <div>
          <h4>Categories</h4>
          <Link to="/products?category=steel-product">Steel Product</Link>
          <Link to="/products?category=home-decor">Home Decor</Link>
          <Link to="/products?category=building-interior-item">Building Interior Item</Link>
          <Link to="/products?category=building-exterior">Building Exterior</Link>
        </div>
        <div>
          <h4>Policies</h4>
          {policyLinks.slice(0, 5).map((p) => (
            <Link key={p.slug} to={`/policies/${p.slug}`}>
              {p.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="container bl-footer-bottom">
        <span>© {new Date().getFullYear()} GLASSTEEL TRADING (OPC) PVT LTD</span>
        <span>Pan-India dispatch · GST invoice</span>
      </div>
    </footer>
  );
}

export default function App() {
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    api.getCompany().then(setCompany).catch(() => setCompany(null));
    api.getStats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="site-shell bl-shell">
      <Header categories={stats?.categories} />
      <main className="site-main">
        <Outlet context={{ company, stats, user }} />
      </main>
      <Footer company={company} />
    </div>
  );
}
