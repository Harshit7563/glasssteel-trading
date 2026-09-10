import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../components/ProductCard";

const PRICE_PRESETS = [
  { label: "All prices", min: "", max: "" },
  { label: "Under ₹500", min: "100", max: "500" },
  { label: "₹500 – ₹2,000", min: "500", max: "2000" },
  { label: "₹2,000 – ₹5,000", min: "2000", max: "5000" },
  { label: "₹5,000 – ₹10,000", min: "5000", max: "10000" },
];

const SORTS = [
  { value: "popular", label: "Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
  { value: "newest", label: "Newest" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "all";
  const q = searchParams.get("q") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "popular";
  const page = Number(searchParams.get("page") || "1");

  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchDraft, setSearchDraft] = useState(q);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setSearchDraft(q);
  }, [q]);

  useEffect(() => {
    setLoading(true);
    const params = {
      sort,
      page: String(page),
      limit: "24",
    };
    if (category !== "all") params.category = category;
    if (q) params.q = q;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    api
      .getProducts(params)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, q, minPrice, maxPrice, sort, page]);

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === category),
    [categories, category]
  );

  function patchParams(next) {
    const merged = {
      category: category === "all" ? undefined : category,
      q: q || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sort: sort === "popular" ? undefined : sort,
      page: undefined,
      ...next,
    };
    const clean = {};
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== "all") clean[k] = String(v);
    });
    setSearchParams(clean);
  }

  function onSearch(e) {
    e.preventDefault();
    patchParams({ q: searchDraft.trim() || undefined, page: undefined });
  }

  return (
    <section className="section shop-section" style={{ paddingTop: 0 }}>
      <div className="container page-hero">
        <h1>{activeCategory?.name || "All products"}</h1>
        <p>
          {activeCategory?.description ||
            "Steel, decor, interior & exterior — prices incl. GST."}
        </p>
      </div>

      <div className="container">
        <form className="shop-toolbar" onSubmit={onSearch}>
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder='Search "cooker", "mirror", "facade"…'
            aria-label="Search products"
          />
          <select
            value={sort}
            onChange={(e) => patchParams({ sort: e.target.value })}
            aria-label="Sort products"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>

        <div className="filter-bar" role="tablist" aria-label="Categories">
          <button
            type="button"
            className={`filter-chip${category === "all" ? " active" : ""}`}
            onClick={() => patchParams({ category: "all" })}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-chip${category === cat.slug ? " active" : ""}`}
              onClick={() => patchParams({ category: cat.slug })}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="filter-bar price-bar" aria-label="Price filters">
          {PRICE_PRESETS.map((p) => {
            const active =
              String(minPrice) === String(p.min) &&
              String(maxPrice) === String(p.max);
            return (
              <button
                key={p.label}
                type="button"
                className={`filter-chip${active ? " active" : ""}`}
                onClick={() =>
                  patchParams({ minPrice: p.min, maxPrice: p.max })
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="shop-meta-line">
          <span>
            {loading ? "Loading…" : `${data.total.toLocaleString("en-IN")} items`}
          </span>
          <span>
            Page {page} of {data.totalPages}
          </span>
        </div>

        {loading ? (
          <p className="loading">Loading products…</p>
        ) : data.items.length === 0 ? (
          <p className="empty">No products match these filters.</p>
        ) : (
          <div className="bl-grid">
            {data.items.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {data.totalPages > 1 ? (
          <div className="pager">
            <button
              type="button"
              className="btn btn-outline"
              disabled={page <= 1}
              onClick={() => patchParams({ page: page - 1 })}
            >
              Previous
            </button>
            <span>
              {page} / {data.totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline"
              disabled={page >= data.totalPages}
              onClick={() => patchParams({ page: page + 1 })}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
