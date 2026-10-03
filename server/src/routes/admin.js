import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { adminRequired } from "../auth.js";
import { query } from "../db/pool.js";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safe = ext.match(/\.(jpe?g|png|webp|gif)$/) ? ext : ".jpg";
    cb(null, `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

router.use(adminRequired);

export async function ensureProductImagesColumn() {
  await query(
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls JSONB NOT NULL DEFAULT '[]'::jsonb`
  );
  await query(
    `UPDATE products
     SET image_urls = jsonb_build_array(image_url)
     WHERE (image_urls IS NULL OR image_urls = '[]'::jsonb)
       AND image_url IS NOT NULL
       AND image_url <> ''`
  );
}

function normalizeImageUrls(urls, primary) {
  const list = [];
  if (Array.isArray(urls)) {
    list.push(...urls);
  } else if (typeof urls === "string" && urls.trim()) {
    try {
      const parsed = JSON.parse(urls);
      if (Array.isArray(parsed)) list.push(...parsed);
      else list.push(urls);
    } catch {
      list.push(...urls.split(",").map((s) => s.trim()));
    }
  }
  if (primary) list.unshift(primary);
  return [
    ...new Set(
      list
        .map((u) => String(u || "").trim())
        .filter(Boolean)
    ),
  ];
}

router.get("/stats", async (_req, res) => {
  try {
    const products = await query(`SELECT COUNT(*)::int AS n FROM products`);
    const categories = await query(`SELECT COUNT(*)::int AS n FROM categories`);
    let orders = 0;
    let inquiries = 0;
    try {
      orders = (await query(`SELECT COUNT(*)::int AS n FROM orders`)).rows[0].n;
    } catch {
      /* table may not exist yet */
    }
    try {
      inquiries = (await query(`SELECT COUNT(*)::int AS n FROM inquiries`)).rows[0].n;
    } catch {
      /* table may not exist yet */
    }
    res.json({
      products: products.rows[0].n,
      categories: categories.rows[0].n,
      orders,
      inquiries,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load admin stats" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const { q, category, page = "1", limit = "40" } = req.query;
    const clauses = [];
    const params = [];

    if (category) {
      params.push(category);
      clauses.push(`c.slug = $${params.length}`);
    }
    if (q?.trim()) {
      params.push(`%${q.trim()}%`);
      clauses.push(
        `(p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length} OR p.summary ILIKE $${params.length})`
      );
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 40));
    const offset = (pageNum - 1) * limitNum;

    const countResult = await query(
      `SELECT COUNT(*)::int AS total
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ${where}`,
      params
    );

    params.push(limitNum, offset);
    const { rows } = await query(
      `SELECT p.*, c.slug AS category_slug, c.name AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ${where}
       ORDER BY p.id DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      items: rows,
      total: countResult.rows[0].total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(1, Math.ceil(countResult.rows[0].total / limitNum)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load products" });
  }
});

function parseProductBody(body = {}) {
  const name = String(body.name || "").trim();
  const category_id = parseInt(body.category_id, 10);
  const price_inr = Number(body.price_inr);
  const mrp_inr = Number(body.mrp_inr || body.price_inr);

  if (!name || !category_id || !Number.isFinite(price_inr)) {
    return { error: "Name, category, and price are required" };
  }

  return {
    category_id,
    sku: String(body.sku || "").trim() || null,
    name,
    summary: String(body.summary || "").trim() || name,
    details: String(body.details || "").trim() || name,
    material: String(body.material || "").trim() || null,
    finish: String(body.finish || "").trim() || null,
    size_text: String(body.size_text || "").trim() || null,
    thickness: String(body.thickness || "").trim() || null,
    application: String(body.application || "").trim() || null,
    unit: String(body.unit || "piece").trim() || "piece",
    price_inr,
    mrp_inr: Number.isFinite(mrp_inr) ? mrp_inr : price_inr,
    gst_percent: Number(body.gst_percent) || 18,
    moq: Math.max(1, parseInt(body.moq, 10) || 1),
    stock_status: String(body.stock_status || "In Stock").trim() || "In Stock",
    featured: body.featured === true || body.featured === "true" || body.featured === "on",
    image_gradient: String(body.image_gradient || "steel").trim() || "steel",
    ...(() => {
      const image_urls = normalizeImageUrls(body.image_urls, body.image_url);
      return {
        image_url: image_urls[0] || null,
        image_urls,
      };
    })(),
  };
}

async function nextSku() {
  const { rows } = await query(`SELECT COALESCE(MAX(id), 0)::int AS m FROM products`);
  return `GS-A${String(rows[0].m + 1).padStart(5, "0")}`;
}

router.post("/products", async (req, res) => {
  try {
    const data = parseProductBody(req.body);
    if (data.error) return res.status(400).json({ error: data.error });

    const sku = data.sku || (await nextSku());
    const image_urls = data.image_urls.length
      ? data.image_urls
      : ["/products/steel-01.jpg"];
    const image_url = image_urls[0];

    const { rows } = await query(
      `INSERT INTO products (
         category_id, sku, name, summary, details, material, finish,
         size_text, thickness, application, unit, price_inr, mrp_inr,
         gst_percent, moq, stock_status, rating, sold_count, featured,
         image_gradient, image_url, image_urls
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,4.5,0,$17,$18,$19,$20::jsonb
       )
       RETURNING *`,
      [
        data.category_id,
        sku,
        data.name,
        data.summary,
        data.details,
        data.material,
        data.finish,
        data.size_text,
        data.thickness,
        data.application,
        data.unit,
        data.price_inr,
        data.mrp_inr,
        data.gst_percent,
        data.moq,
        data.stock_status,
        data.featured,
        data.image_gradient,
        image_url,
        JSON.stringify(image_urls),
      ]
    );

    res.status(201).json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "SKU already exists" });
    }
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = parseProductBody(req.body);
    if (data.error) return res.status(400).json({ error: data.error });

    const existing = await query(
      `SELECT id, sku, image_url, image_urls FROM products WHERE id = $1`,
      [id]
    );
    if (!existing.rows[0]) return res.status(404).json({ error: "Product not found" });

    const sku = data.sku || existing.rows[0].sku;
    const prevUrls = normalizeImageUrls(
      existing.rows[0].image_urls,
      existing.rows[0].image_url
    );
    const image_urls = data.image_urls.length ? data.image_urls : prevUrls;
    const image_url = image_urls[0] || existing.rows[0].image_url;

    const { rows } = await query(
      `UPDATE products SET
         category_id=$1, sku=$2, name=$3, summary=$4, details=$5,
         material=$6, finish=$7, size_text=$8, thickness=$9, application=$10,
         unit=$11, price_inr=$12, mrp_inr=$13, gst_percent=$14, moq=$15,
         stock_status=$16, featured=$17, image_gradient=$18, image_url=$19,
         image_urls=$20::jsonb
       WHERE id=$21
       RETURNING *`,
      [
        data.category_id,
        sku,
        data.name,
        data.summary,
        data.details,
        data.material,
        data.finish,
        data.size_text,
        data.thickness,
        data.application,
        data.unit,
        data.price_inr,
        data.mrp_inr,
        data.gst_percent,
        data.moq,
        data.stock_status,
        data.featured,
        data.image_gradient,
        image_url,
        JSON.stringify(image_urls),
        id,
      ]
    );

    res.json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "SKU already exists" });
    }
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await query(`DELETE FROM orders WHERE product_id = $1`, [id]).catch(() => {});
    const { rowCount } = await query(`DELETE FROM products WHERE id = $1`, [id]);
    if (!rowCount) return res.status(404).json({ error: "Product not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

router.post("/upload", (req, res) => {
  upload.fields([
    { name: "images", maxCount: 12 },
    { name: "image", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed" });
    }
    const files = [
      ...(req.files?.images || []),
      ...(req.files?.image || []),
    ];
    if (!files.length) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    const image_urls = files.map((f) => `/uploads/${f.filename}`);
    res.status(201).json({
      ok: true,
      image_url: image_urls[0],
      image_urls,
      filename: files[0].filename,
    });
  });
});

export default router;
