import { Router } from "express";
import { query } from "../db/pool.js";

const router = Router();

router.get("/company", async (_req, res) => {
  try {
    const { rows } = await query("SELECT * FROM company_info WHERE id = 1");
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load company info" });
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const [totals, cats, price] = await Promise.all([
      query(
        `SELECT COUNT(*)::int AS products,
                COUNT(*) FILTER (WHERE featured)::int AS featured,
                COUNT(*) FILTER (WHERE stock_status = 'In Stock')::int AS in_stock
         FROM products`
      ),
      query(
        `SELECT c.slug, c.name, COUNT(p.id)::int AS count
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id
         GROUP BY c.id
         ORDER BY c.sort_order`
      ),
      query(
        `SELECT MIN(price_inr)::float AS min_price,
                MAX(price_inr)::float AS max_price
         FROM products`
      ),
    ]);

    res.json({
      ...totals.rows[0],
      min_price: price.rows[0].min_price,
      max_price: price.rows[0].max_price,
      categories: cats.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

router.get("/categories", async (_req, res) => {
  try {
    const { rows } = await query(
      "SELECT * FROM categories ORDER BY sort_order ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load categories" });
  }
});

router.get("/categories/:slug", async (req, res) => {
  try {
    const { rows } = await query(
      "SELECT * FROM categories WHERE slug = $1",
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: "Category not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load category" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const {
      category,
      featured,
      q,
      minPrice,
      maxPrice,
      sort = "popular",
      page = "1",
      limit = "24",
    } = req.query;

    const clauses = [];
    const params = [];

    if (category) {
      params.push(category);
      clauses.push(`c.slug = $${params.length}`);
    }
    if (featured === "true") {
      clauses.push("p.featured = TRUE");
    }
    if (q?.trim()) {
      params.push(`%${q.trim()}%`);
      clauses.push(
        `(p.name ILIKE $${params.length} OR p.summary ILIKE $${params.length} OR p.sku ILIKE $${params.length} OR p.material ILIKE $${params.length})`
      );
    }
    if (minPrice) {
      params.push(Number(minPrice));
      clauses.push(`p.price_inr >= $${params.length}`);
    }
    if (maxPrice) {
      params.push(Number(maxPrice));
      clauses.push(`p.price_inr <= $${params.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

    const orderMap = {
      popular: "p.sold_count DESC, p.rating DESC",
      price_asc: "p.price_inr ASC",
      price_desc: "p.price_inr DESC",
      rating: "p.rating DESC, p.sold_count DESC",
      newest: "p.id DESC",
    };
    const orderBy = orderMap[sort] || orderMap.popular;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(60, Math.max(1, parseInt(limit, 10) || 24));
    const offset = (pageNum - 1) * limitNum;

    const countResult = await query(
      `SELECT COUNT(*)::int AS total
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ${where}`,
      params
    );

    params.push(limitNum);
    params.push(offset);

    const { rows } = await query(
      `SELECT p.*, c.slug AS category_slug, c.name AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ${where}
       ORDER BY ${orderBy}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = countResult.rows[0].total;
    res.json({
      items: rows,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load products" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.*, c.slug AS category_slug, c.name AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Product not found" });

    const related = await query(
      `SELECT p.*, c.slug AS category_slug, c.name AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.category_id = $1 AND p.id <> $2
       ORDER BY p.sold_count DESC
       LIMIT 4`,
      [rows[0].category_id, rows[0].id]
    );

    res.json({ product: rows[0], related: related.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load product" });
  }
});

router.post("/inquiries", async (req, res) => {
  try {
    const { name, email, phone, company, category, message } = req.body || {};

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res
        .status(400)
        .json({ error: "Name, email, and message are required" });
    }

    const { rows } = await query(
      `INSERT INTO inquiries (name, email, phone, company, category, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [
        name.trim(),
        email.trim(),
        phone?.trim() || null,
        company?.trim() || null,
        category?.trim() || null,
        message.trim(),
      ]
    );

    res.status(201).json({
      ok: true,
      id: rows[0].id,
      created_at: rows[0].created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const {
      product_id,
      quantity,
      amount_inr,
      payment_method,
      buyer_name,
      buyer_email,
      buyer_phone,
      buyer_address,
      gstin,
    } = req.body || {};

    if (
      !product_id ||
      !quantity ||
      !amount_inr ||
      !payment_method ||
      !buyer_name?.trim() ||
      !buyer_email?.trim() ||
      !buyer_phone?.trim() ||
      !buyer_address?.trim()
    ) {
      return res.status(400).json({ error: "Missing payment / buyer details" });
    }

    const product = await query(`SELECT id, price_inr, moq FROM products WHERE id = $1`, [
      product_id,
    ]);
    if (!product.rows[0]) {
      return res.status(404).json({ error: "Product not found" });
    }

    const qty = Math.max(Number(product.rows[0].moq) || 1, parseInt(quantity, 10) || 1);
    const expected = Number(product.rows[0].price_inr) * qty;
    if (Math.abs(Number(amount_inr) - expected) > 0.5) {
      return res.status(400).json({ error: "Amount mismatch. Refresh and try again." });
    }

    const orderRef = `GS${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 900 + 100
    )}`;

    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_ref TEXT UNIQUE NOT NULL,
        product_id INT NOT NULL REFERENCES products(id),
        quantity INT NOT NULL DEFAULT 1,
        amount_inr NUMERIC(12,2) NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'paid',
        buyer_name TEXT NOT NULL,
        buyer_email TEXT NOT NULL,
        buyer_phone TEXT NOT NULL,
        buyer_address TEXT NOT NULL,
        gstin TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const { rows } = await query(
      `INSERT INTO orders (
        order_ref, product_id, quantity, amount_inr, payment_method, status,
        buyer_name, buyer_email, buyer_phone, buyer_address, gstin
      ) VALUES ($1,$2,$3,$4,$5,'paid',$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        orderRef,
        product_id,
        qty,
        expected,
        payment_method,
        buyer_name.trim(),
        buyer_email.trim(),
        buyer_phone.trim(),
        buyer_address.trim(),
        gstin?.trim() || null,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

export default router;
