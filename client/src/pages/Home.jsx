import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../components/ProductCard";

const CAT_META = {
  "building-interior": { tone: "t-mint", short: "BI", img: "/products/bi-partition.jpg" },
  "home-interior": { tone: "t-peach", short: "HI", img: "/products/hi-sofa.jpg" },
  "steel-antique-glass": { tone: "t-lilac", short: "SG", img: "/products/sg-window.jpg" },
  "steel-product": { tone: "t-steel", short: "ST", img: "/products/sp-cooker.jpg" },
  "home-decor": { tone: "t-pink", short: "HD", img: "/products/hd-vase.jpg" },
  "building-interior-item": { tone: "t-sky", short: "II", img: "/products/bii-laminate.jpg" },
  "building-exterior": { tone: "t-sand", short: "EX", img: "/products/be-facade.jpg" },
};

function Rail({ title, subtitle, to, items, loading }) {
  return (
    <section className="container bl-rail">
      <div className="bl-rail-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {to ? (
          <Link to={to} className="bl-seeall">
            View all
          </Link>
        ) : null}
      </div>
      {loading ? (
        <p className="loading">Loading…</p>
      ) : (
        <div className="bl-rail-scroll">
          {items.map((item) => (
            <div key={item.id} className="bl-rail-item">
              <ProductCard item={item} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const { stats } = useOutletContext();
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [steel, setSteel] = useState([]);
  const [decor, setDecor] = useState([]);
  const [exterior, setExterior] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProducts({ featured: "true", limit: "12", sort: "popular" }),
      api.getProducts({ minPrice: "100", maxPrice: "500", limit: "12", sort: "popular" }),
      api.getProducts({ category: "steel-product", limit: "12", sort: "popular" }),
      api.getProducts({ category: "home-decor", limit: "12", sort: "popular" }),
      api.getProducts({ category: "building-exterior", limit: "12", sort: "popular" }),
    ])
      .then(([a, b, c, d, e]) => {
        setFeatured(a.items || []);
        setDeals(b.items || []);
        setSteel(c.items || []);
        setDecor(d.items || []);
        setExterior(e.items || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cats = stats?.categories || [];

  return (
    <div className="bl-home">
      <div className="container bl-promo-strip">
        <span>GST inclusive pricing</span>
        <span>{stats?.products?.toLocaleString("en-IN") || "168"} curated SKUs</span>
        <span>Pan-India dispatch</span>
        <span>GlassSteel Pay</span>
      </div>

      <section className="container bl-banners">
        <Link to="/products?category=steel-product" className="bl-banner b1">
          <p>Steel Product</p>
          <h2>Cookware & kitchen steel</h2>
          <span>Browse aisle →</span>
        </Link>
        <Link to="/products?category=home-decor" className="bl-banner b2">
          <p>Home Decor</p>
          <h2>Wall art, mirrors & more</h2>
          <span>Browse aisle →</span>
        </Link>
        <Link to="/products?category=building-exterior" className="bl-banner b3">
          <p>Building Exterior</p>
          <h2>Facade & cladding</h2>
          <span>Browse aisle →</span>
        </Link>
      </section>

      <section className="container bl-section">
        <h2 className="bl-title">Shop by category</h2>
        <div className="bl-cat-grid">
          {cats.map((cat) => {
            const meta = CAT_META[cat.slug] || {
              tone: "t-mint",
              short: "GS",
              img: "/products/steel-01.jpg",
            };
            return (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className={`bl-cat ${meta.tone}`}
              >
                <span className="bl-cat-img">
                  <img src={meta.img} alt="" loading="lazy" />
                </span>
                <strong>{cat.name}</strong>
                <small>{cat.count?.toLocaleString("en-IN")} items</small>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container bl-deals">
        <div className="bl-deal-card">
          <h3>Under ₹500</h3>
          <p>Value hardware & décor picks</p>
          <Link to="/products?minPrice=100&maxPrice=500">Open deals →</Link>
        </div>
        <div className="bl-deal-card alt">
          <h3>Bestsellers</h3>
          <p>Most ordered SKUs this week</p>
          <Link to="/products?sort=popular">Open list →</Link>
        </div>
        <div className="bl-deal-card dark">
          <h3>Bulk / dealer</h3>
          <p>Project rates on MOQ</p>
          <Link to="/contact">Talk to sales →</Link>
        </div>
      </section>

      <Rail
        title="Bestsellers"
        subtitle="Moving fast across the catalogue"
        to="/products?sort=popular"
        items={featured}
        loading={loading}
      />
      <Rail
        title="Under ₹500"
        subtitle="Incl. GST"
        to="/products?minPrice=100&maxPrice=500"
        items={deals}
        loading={loading}
      />
      <Rail
        title="Steel Product"
        subtitle="Kitchen & cookware steel"
        to="/products?category=steel-product"
        items={steel}
        loading={loading}
      />
      <Rail
        title="Home Decor"
        subtitle="Walls, mirrors & accents"
        to="/products?category=home-decor"
        items={decor}
        loading={loading}
      />
      <Rail
        title="Building Exterior"
        subtitle="Facade, cladding & elevation"
        to="/products?category=building-exterior"
        items={exterior}
        loading={loading}
      />
    </div>
  );
}
