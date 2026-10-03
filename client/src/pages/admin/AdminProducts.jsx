import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../auth";
import { inr } from "../../utils";

const EMPTY = {
  id: null,
  category_id: "",
  sku: "",
  name: "",
  summary: "",
  details: "",
  material: "",
  finish: "",
  size_text: "",
  thickness: "",
  application: "",
  unit: "piece",
  price_inr: "",
  mrp_inr: "",
  gst_percent: "18",
  moq: "1",
  stock_status: "In Stock",
  featured: false,
  image_url: "",
};

export default function AdminProducts() {
  const { logout, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [message, setMessage] = useState("");

  const editing = !!form.id;

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ id: c.id, label: c.name, slug: c.slug })),
    [categories]
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [cats, products, st] = await Promise.all([
        api.getCategories(),
        api.adminProducts({ q, category, limit: "100" }),
        api.adminStats(),
      ]);
      setCategories(cats);
      setItems(products.items || []);
      setStats(st);
      if (!form.category_id && cats[0]) {
        setForm((f) => ({ ...f, category_id: String(cats[0].id) }));
      }
    } catch (err) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startCreate() {
    setMessage("");
    setForm({
      ...EMPTY,
      category_id: categories[0] ? String(categories[0].id) : "",
    });
  }

  function startEdit(item) {
    setMessage("");
    setForm({
      id: item.id,
      category_id: String(item.category_id),
      sku: item.sku || "",
      name: item.name || "",
      summary: item.summary || "",
      details: item.details || "",
      material: item.material || "",
      finish: item.finish || "",
      size_text: item.size_text || "",
      thickness: item.thickness || "",
      application: item.application || "",
      unit: item.unit || "piece",
      price_inr: String(item.price_inr ?? ""),
      mrp_inr: String(item.mrp_inr ?? ""),
      gst_percent: String(item.gst_percent ?? "18"),
      moq: String(item.moq ?? "1"),
      stock_status: item.stock_status || "In Stock",
      featured: !!item.featured,
      image_url: item.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadBusy(true);
    setMessage("");
    try {
      const data = await api.adminUploadImage(file);
      setForm((f) => ({ ...f, image_url: data.image_url }));
      setMessage("Image uploaded");
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploadBusy(false);
      e.target.value = "";
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        price_inr: Number(form.price_inr),
        mrp_inr: Number(form.mrp_inr || form.price_inr),
        gst_percent: Number(form.gst_percent || 18),
        moq: Number(form.moq || 1),
        featured: !!form.featured,
      };
      if (editing) {
        await api.adminUpdateProduct(form.id, payload);
        setMessage("Product updated");
      } else {
        await api.adminCreateProduct(payload);
        setMessage("Product created");
      }
      startCreate();
      await load();
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(item) {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setError("");
    try {
      await api.adminDeleteProduct(item.id);
      if (form.id === item.id) startCreate();
      await load();
      setMessage("Product deleted");
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  async function onFilter(e) {
    e.preventDefault();
    await load();
  }

  return (
    <section className="section admin-section" style={{ paddingTop: 0 }}>
      <div className="container admin-wrap">
        <header className="admin-top">
          <div>
            <span className="eyebrow">Admin</span>
            <h1>Product dashboard</h1>
            <p className="admin-lead">
              Upload images and manage catalogue products. Signed in as{" "}
              <b>{user?.email}</b>
            </p>
          </div>
          <div className="admin-top-actions">
            <Link className="btn btn-outline" to="/">
              View site
            </Link>
            <button type="button" className="btn btn-dark" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        {stats ? (
          <div className="admin-stats">
            <div>
              <span>Products</span>
              <b>{stats.products}</b>
            </div>
            <div>
              <span>Categories</span>
              <b>{stats.categories}</b>
            </div>
            <div>
              <span>Orders</span>
              <b>{stats.orders}</b>
            </div>
            <div>
              <span>Inquiries</span>
              <b>{stats.inquiries}</b>
            </div>
          </div>
        ) : null}

        <div className="admin-grid">
          <form className="admin-card contact-form" onSubmit={onSubmit}>
            <div className="admin-card-head">
              <h2>{editing ? `Edit #${form.id}` : "Add product"}</h2>
              {editing ? (
                <button type="button" className="btn btn-ghost" onClick={startCreate}>
                  New
                </button>
              ) : null}
            </div>

            <div className="field">
              <label>Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                required
              >
                <option value="" disabled>
                  Select category
                </option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Product name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div className="admin-two">
              <div className="field">
                <label>SKU (optional)</label>
                <input
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  placeholder="Auto if empty"
                />
              </div>
              <div className="field">
                <label>Unit</label>
                <input
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                />
              </div>
            </div>

            <div className="field">
              <label>Short summary</label>
              <input
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>Details</label>
              <textarea
                rows={3}
                value={form.details}
                onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
              />
            </div>

            <div className="admin-two">
              <div className="field">
                <label>Price (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={form.price_inr}
                  onChange={(e) => setForm((f) => ({ ...f, price_inr: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>MRP (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={form.mrp_inr}
                  onChange={(e) => setForm((f) => ({ ...f, mrp_inr: e.target.value }))}
                />
              </div>
            </div>

            <div className="admin-two">
              <div className="field">
                <label>Material</label>
                <input
                  value={form.material}
                  onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Finish</label>
                <input
                  value={form.finish}
                  onChange={(e) => setForm((f) => ({ ...f, finish: e.target.value }))}
                />
              </div>
            </div>

            <div className="admin-two">
              <div className="field">
                <label>Size</label>
                <input
                  value={form.size_text}
                  onChange={(e) => setForm((f) => ({ ...f, size_text: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Stock</label>
                <select
                  value={form.stock_status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock_status: e.target.value }))
                  }
                >
                  <option>In Stock</option>
                  <option>Made to Order</option>
                  <option>Out of Stock</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Product image</label>
              <input type="file" accept="image/*" onChange={onUpload} disabled={uploadBusy} />
              {form.image_url ? (
                <div className="admin-preview">
                  <img src={form.image_url} alt="Preview" />
                  <code>{form.image_url}</code>
                </div>
              ) : null}
            </div>

            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              />
              Featured on home
            </label>

            {error ? <p className="form-status error">{error}</p> : null}
            {message ? <p className="form-status ok">{message}</p> : null}

            <button className="btn btn-primary" type="submit" disabled={busy || uploadBusy}>
              {busy ? "Saving…" : editing ? "Update product" : "Upload product"}
            </button>
          </form>

          <div className="admin-card">
            <form className="admin-filters" onSubmit={onFilter}>
              <input
                placeholder="Search name / SKU"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button className="btn btn-dark" type="submit">
                Filter
              </button>
            </form>

            {loading ? (
              <p className="loading">Loading products…</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <img
                            className="admin-thumb"
                            src={item.image_url}
                            alt=""
                            loading="lazy"
                          />
                        </td>
                        <td>
                          <b>{item.name}</b>
                          <span>
                            {item.sku} · {item.category_name}
                          </span>
                        </td>
                        <td>{inr(item.price_inr)}</td>
                        <td className="admin-row-actions">
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => onDelete(item)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!items.length ? <p className="empty">No products found.</p> : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
