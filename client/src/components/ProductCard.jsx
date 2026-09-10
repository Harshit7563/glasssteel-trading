import { Link } from "react-router-dom";
import { discountPercent, inr } from "../utils";

export default function ProductCard({ item }) {
  const off = discountPercent(item.price_inr, item.mrp_inr);
  const src = item.image_url || "/products/steel-01.jpg";
  const rating = Number(item.rating || 0).toFixed(1);

  return (
    <article className="bl-card">
      <Link to={`/products/${item.id}`} className="bl-card-img">
        {off > 0 ? <span className="bl-off">{off}% OFF</span> : null}
        <img src={src} alt={item.name} loading="lazy" width={320} height={260} />
        <span className={`bl-eta${item.stock_status === "In Stock" ? "" : " muted"}`}>
          {item.stock_status}
        </span>
      </Link>

      <div className="bl-card-info">
        <p className="bl-card-cat">{item.category_name || item.sku}</p>
        <Link to={`/products/${item.id}`}>
          <h3>{item.name}</h3>
        </Link>

        {item.summary ? <p className="bl-card-summary">{item.summary}</p> : null}

        <ul className="bl-card-specs">
          <li>
            <span>Size</span>
            <b>{item.size_text || "—"}</b>
          </li>
          <li>
            <span>Material</span>
            <b>{item.material || "—"}</b>
          </li>
          <li>
            <span>Finish</span>
            <b>{item.finish || "—"}</b>
          </li>
          <li>
            <span>MOQ</span>
            <b>
              {item.moq} {item.unit || "pc"}
            </b>
          </li>
        </ul>

        <div className="bl-card-meta">
          <span className="bl-card-rating">{rating} ★</span>
          <span>{Number(item.sold_count || 0).toLocaleString("en-IN")}+ sold</span>
        </div>

        <div className="bl-card-row">
          <div>
            <div className="bl-price">
              <b>{inr(item.price_inr)}</b>
              {off > 0 ? <s>{inr(item.mrp_inr)}</s> : null}
            </div>
            <p className="bl-incl">Incl. GST · per {item.unit || "piece"}</p>
          </div>
          <Link
            to={`/pay/${item.id}`}
            className="bl-add"
            onClick={(e) => e.stopPropagation()}
          >
            ADD
          </Link>
        </div>
      </div>
    </article>
  );
}
