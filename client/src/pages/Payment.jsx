import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { inr } from "../utils";

const METHODS = [
  { id: "upi", label: "UPI", hint: "GPay / PhonePe / Paytm" },
  { id: "netbanking", label: "Net Banking", hint: "All major banks" },
  { id: "card", label: "Debit / Credit Card", hint: "Visa · Mastercard · RuPay" },
  { id: "bank_transfer", label: "Bank Transfer", hint: "NEFT / IMPS / RTGS" },
];

export default function Payment() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { company } = useOutletContext();
  const { user, isLoggedIn } = useAuth();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(null);
  const [method, setMethod] = useState("upi");
  const [qty, setQty] = useState(Math.max(1, Number(searchParams.get("qty") || 1)));
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gstin: "",
    upi_vpa: "",
    card_number: "",
    card_expiry: "",
    card_cvv: "",
  });

  useEffect(() => {
    setLoading(true);
    api
      .getProduct(productId)
      .then((d) => {
        setProduct(d.product);
        setQty((q) => Math.max(Number(d.product.moq) || 1, q));
      })
      .catch((err) => setError(err.message || "Product not found"))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      name: f.name || user.name || "",
      email: f.email || user.email || "",
      phone: f.phone || user.phone || "",
    }));
  }, [user]);

  const unitPrice = Number(product?.price_inr) || 0;
  const total = useMemo(() => unitPrice * qty, [unitPrice, qty]);
  const gstRate = Number(product?.gst_percent) || 18;
  const taxable = Math.round(total / (1 + gstRate / 100));
  const gstAmt = total - taxable;

  function update(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onPay(e) {
    e.preventDefault();
    if (!product) return;
    setPaying(true);
    setError("");
    try {
      const order = await api.createOrder({
        product_id: product.id,
        quantity: qty,
        amount_inr: total,
        payment_method: method,
        buyer_name: form.name,
        buyer_email: form.email,
        buyer_phone: form.phone,
        buyer_address: form.address,
        gstin: form.gstin || null,
      });
      setDone(order);
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="loading">Opening secure payment…</p>
        </div>
      </section>
    );
  }

  if (!product) {
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

  if (done) {
    return (
      <section className="section pay-section" style={{ paddingTop: 0 }}>
        <div className="container pay-success">
          <span className="eyebrow">Payment received</span>
          <h1>Order confirmed</h1>
          <p>
            Thank you. GLASSTEEL has recorded your payment of{" "}
            <strong>{inr(done.amount_inr)}</strong> (incl. GST).
          </p>
          <div className="pay-success-box">
            <div>
              <span>Order ID</span>
              <strong>{done.order_ref}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{done.status}</strong>
            </div>
            <div>
              <span>Method</span>
              <strong>{done.payment_method}</strong>
            </div>
          </div>
          <div className="cta-row">
            <Link className="btn btn-primary" to={`/products/${product.id}`}>
              Back to product
            </Link>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/products")}>
              Continue shopping
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section pay-section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="pay-brand-bar">
          <div>
            <p className="pay-secure">Secure checkout</p>
            <h1>GlassSteel Pay</h1>
          </div>
          <p>
            {company?.legal_name || "GLASSTEEL TRADING (OPC) PRIVATE LIMITED"}
            {!isLoggedIn ? (
              <>
                {" · "}
                <Link to={`/login?redirect=${encodeURIComponent(`/pay/${productId}`)}`}>
                  Login
                </Link>
                {" for faster checkout"}
              </>
            ) : null}
          </p>
        </div>

        <div className="pay-layout">
          <form className="pay-form" onSubmit={onPay}>
            <h2>Buyer details</h2>
            <div className="form-row">
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" value={form.name} onChange={update} required />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" value={form.phone} onChange={update} required />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="gstin">GSTIN (optional)</label>
                <input id="gstin" name="gstin" value={form.gstin} onChange={update} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="address">Delivery address</label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={update}
                required
              />
            </div>

            <h2>Quantity</h2>
            <div className="qty-row">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setQty((q) => Math.max(Number(product.moq) || 1, q - 1))}
              >
                −
              </button>
              <strong>{qty}</strong>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
              <span className="gst-note">MOQ {product.moq} · price incl. GST</span>
            </div>

            <h2>Pay with</h2>
            <div className="pay-methods">
              {METHODS.map((m) => (
                <label key={m.id} className={`pay-method${method === m.id ? " active" : ""}`}>
                  <input
                    type="radio"
                    name="method"
                    value={m.id}
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                  />
                  <span>
                    <strong>{m.label}</strong>
                    <small>{m.hint}</small>
                  </span>
                </label>
              ))}
            </div>

            {method === "upi" ? (
              <div className="field">
                <label htmlFor="upi_vpa">UPI ID</label>
                <input
                  id="upi_vpa"
                  name="upi_vpa"
                  placeholder="name@upi"
                  value={form.upi_vpa}
                  onChange={update}
                  required
                />
                <p className="gst-note">
                  Pay to merchant UPI: {company?.upi_id || "glassteel@hdfcbank"}
                </p>
              </div>
            ) : null}

            {method === "card" ? (
              <div className="card-fields">
                <div className="field">
                  <label htmlFor="card_number">Card number</label>
                  <input
                    id="card_number"
                    name="card_number"
                    inputMode="numeric"
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={form.card_number}
                    onChange={update}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="card_expiry">Expiry</label>
                    <input
                      id="card_expiry"
                      name="card_expiry"
                      placeholder="MM/YY"
                      value={form.card_expiry}
                      onChange={update}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="card_cvv">CVV</label>
                    <input
                      id="card_cvv"
                      name="card_cvv"
                      inputMode="numeric"
                      placeholder="***"
                      value={form.card_cvv}
                      onChange={update}
                      required
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {method === "bank_transfer" || method === "netbanking" ? (
              <div className="pay-bank-box">
                <p className="eyebrow">GLASSTEEL account</p>
                <p>
                  <strong>{company?.account_name}</strong>
                </p>
                <p>
                  {company?.bank_name} · A/C {company?.account_number}
                </p>
                <p>IFSC {company?.ifsc_code}</p>
                <p className="gst-note">{company?.escrow_note}</p>
              </div>
            ) : null}

            {error ? <p className="form-status error">{error}</p> : null}

            <button className="btn btn-primary pay-submit" type="submit" disabled={paying}>
              {paying ? "Processing…" : `Pay ${inr(total)} securely`}
            </button>
          </form>

          <aside className="pay-summary">
            <img src={product.image_url} alt={product.name} />
            <p className="shop-sku">{product.sku}</p>
            <h3>{product.name}</h3>
            <div className="pay-breakup">
              <div>
                <span>Unit (incl. GST)</span>
                <strong>{inr(unitPrice)}</strong>
              </div>
              <div>
                <span>Qty</span>
                <strong>{qty}</strong>
              </div>
              <div>
                <span>Taxable value</span>
                <strong>{inr(taxable)}</strong>
              </div>
              <div>
                <span>GST ({gstRate}%)</span>
                <strong>{inr(gstAmt)}</strong>
              </div>
              <div className="pay-total">
                <span>Total payable</span>
                <strong>{inr(total)}</strong>
              </div>
            </div>
            <p className="gst-note">Amount includes GST. GST invoice after payment.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
