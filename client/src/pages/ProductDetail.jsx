import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import { discountPercent, inr, whatsappLink } from "../utils";

const GALLERY = {
  "building-interior": [
    "/products/bi-partition.jpg",
    "/products/bi-lobby.jpg",
    "/products/bi-glass.jpg",
    "/products/bi-door.jpg",
  ],
  "home-interior": [
    "/products/hi-sofa.jpg",
    "/products/hi-dining.jpg",
    "/products/hi-bed.jpg",
    "/products/hi-curtain.jpg",
  ],
  "steel-antique-glass": [
    "/products/sg-window.jpg",
    "/products/sg-screen.jpg",
    "/products/sg-antique.jpg",
    "/products/sg-railing.jpg",
  ],
  "steel-product": [
    "/products/sp-cooker.jpg",
    "/products/sp-pan.jpg",
    "/products/sp-dinner.jpg",
    "/products/sp-tiffin.jpg",
  ],
  "home-decor": [
    "/products/hd-vase.jpg",
    "/products/hd-art.jpg",
    "/products/hd-mirror.jpg",
    "/products/hd-plant.jpg",
  ],
  "building-interior-item": [
    "/products/bii-laminate.jpg",
    "/products/bii-louver.jpg",
    "/products/bii-vinyl.jpg",
    "/products/bii-led.jpg",
  ],
  "building-exterior": [
    "/products/be-facade.jpg",
    "/products/be-cladding.jpg",
    "/products/be-balcony.jpg",
    "/products/be-stone.jpg",
  ],
};

export default function ProductDetail() {
  const { id } = useParams();
  const { company } = useOutletContext();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    setActiveImg(0);
    api
      .getProduct(id)
      .then(setData)
      .catch((err) => setError(err.message || "Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const gallery = useMemo(() => {
    if (!data?.product) return [];
    const pool =
      GALLERY[data.product.category_slug] ||
      GALLERY["steel-antique-glass"];
    const primary = data.product.image_url || pool[0];
    const rest = pool.filter((u) => u !== primary);
    return [primary, ...rest].slice(0, 4);
  }, [data]);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="loading">Loading product details…</p>
        </div>
      </section>
    );
  }

  if (error || !data?.product) {
    return (
      <section className="section">
        <div className="container">
          <p className="empty">{error || "Product not found"}</p>
          <Link className="btn btn-dark" to="/products">
            Back to catalogue
          </Link>
        </div>
      </section>
    );
  }

  const p = data.product;
  const off = discountPercent(p.price_inr, p.mrp_inr);
  const phone = company?.phone || "+91 98765 43210";
  const wa = whatsappLink(
    phone,
    `Namaste, I want details/quote for ${p.sku} — ${p.name} (₹${Number(p.price_inr)}/${p.unit} incl. GST).`
  );

  return (
    <section className="section detail-section" style={{ paddingTop: 0 }}>
      <div className="container detail-wrap">
        <nav className="crumbs">
          <Link to="/products">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${p.category_slug}`}>
            {p.category_name}
          </Link>
          <span>/</span>
          <span>{p.sku}</span>
        </nav>

        <div className="detail-grid">
          <div className="detail-gallery">
            <div className="detail-media">
              <img
                src={gallery[activeImg]}
                alt={p.name}
                width={900}
                height={700}
              />
              {off > 0 ? <span className="badge-off">{off}% OFF</span> : null}
            </div>
            <div className="detail-thumbs">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className={i === activeImg ? "active" : ""}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Photo ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div className="detail-info">
            <p className="shop-sku">
              {p.sku} · {p.category_name}
            </p>
            <h1>{p.name}</h1>
            <div className="shop-rating" style={{ margin: "0.75rem 0 1rem" }}>
              <span className="rating-pill">
                {Number(p.rating).toFixed(1)} ★
              </span>
              <span className="sold">{p.sold_count}+ sold in India</span>
              <span className="badge-stock inline">{p.stock_status}</span>
            </div>

            <div className="detail-price">
              <strong>{inr(p.price_inr)}</strong>
              {off > 0 ? <s>{inr(p.mrp_inr)}</s> : null}
              <span className="per-unit">per {p.unit}</span>
            </div>
            <p className="gst-note">
              Incl. of GST ({Number(p.gst_percent)}%) · MOQ {p.moq} {p.unit}
              {Number(p.moq) > 1 ? "s" : ""}
            </p>

            <p className="detail-summary">{p.summary}</p>
            <p className="detail-copy">{p.details}</p>

            <table className="spec-table">
              <tbody>
                <tr>
                  <th>Material</th>
                  <td>{p.material}</td>
                </tr>
                <tr>
                  <th>Finish</th>
                  <td>{p.finish}</td>
                </tr>
                <tr>
                  <th>Size</th>
                  <td>{p.size_text}</td>
                </tr>
                <tr>
                  <th>Thickness</th>
                  <td>{p.thickness}</td>
                </tr>
                <tr>
                  <th>Best for</th>
                  <td>{p.application}</td>
                </tr>
                <tr>
                  <th>Unit</th>
                  <td>{p.unit}</td>
                </tr>
              </tbody>
            </table>

            <div className="cta-row detail-actions">
              <Link className="btn btn-primary" to={`/pay/${p.id}`}>
                ADD
              </Link>
              <a className="btn btn-dark" href={wa} target="_blank" rel="noreferrer">
                WhatsApp quote
              </a>
              <Link
                className="btn btn-outline"
                to={`/contact?category=${p.category_slug}`}
              >
                Enquire
              </Link>
            </div>
          </div>
        </div>

        {data.related?.length ? (
          <div className="related-block">
            <div className="section-head">
              <span className="eyebrow">Related</span>
              <h2>More in {p.category_name}</h2>
            </div>
            <div className="bl-grid">
              {data.related.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
