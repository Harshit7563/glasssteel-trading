import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import { discountPercent, inr } from "../utils";

export default function ProductDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .getProduct(id)
      .then(setData)
      .catch((err) => setError(err.message || "Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const primaryImg = data?.product?.image_url || "/products/steel-01.jpg";

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
                src={primaryImg}
                alt={p.name}
                width={900}
                height={700}
              />
              {off > 0 ? <span className="badge-off">{off}% OFF</span> : null}
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
