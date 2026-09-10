import dotenv from "dotenv";
import { pool } from "./pool.js";

dotenv.config();

const schema = `
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  details TEXT NOT NULL,
  material TEXT,
  finish TEXT,
  size_text TEXT,
  thickness TEXT,
  application TEXT,
  unit TEXT NOT NULL DEFAULT 'piece',
  price_inr NUMERIC(10,2) NOT NULL,
  mrp_inr NUMERIC(10,2) NOT NULL,
  gst_percent NUMERIC(4,1) NOT NULL DEFAULT 18,
  moq INT NOT NULL DEFAULT 1,
  stock_status TEXT NOT NULL DEFAULT 'In Stock',
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  sold_count INT NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  image_gradient TEXT NOT NULL DEFAULT 'steel',
  image_url TEXT NOT NULL DEFAULT '/products/steel-01.jpg',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  category TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_info (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  legal_name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  about TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  branch_name TEXT,
  upi_id TEXT,
  escrow_note TEXT
);
`;

const migrate = `
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_text TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS thickness TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS application TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'piece';
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_inr NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS mrp_inr NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_percent NUMERIC(4,1) DEFAULT 18;
ALTER TABLE products ADD COLUMN IF NOT EXISTS moq INT DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'In Stock';
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 4.5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sold_count INT DEFAULT 0;
`;

function pick(arr, i) {
  return arr[i % arr.length];
}

function priceBand(min, max, i) {
  const lo = Math.max(100, Math.floor(min / 100) * 100);
  const hi = Math.min(10000, Math.ceil(max / 100) * 100);
  const steps = Math.max(1, Math.round((hi - lo) / 100));
  const step = (i * 7 + (i % 11)) % (steps + 1);
  return lo + step * 100;
}

function roundHundred(n) {
  return Math.min(10000, Math.max(100, Math.round(n / 100) * 100));
}

const templates = {
  "building-interior": [
    {
      base: "MS Partition Frame",
      summary: "Modular mild steel frame for office partitions.",
      details:
        "Site-ready MS partition frame with powder-coat option. Suitable for gypsum, ACP, and glass infills. Includes leveling feet and junction plates.",
      materials: ["Mild steel", "GI steel", "SS 202"],
      finishes: ["Powder coat white", "Matte black", "Grey primer"],
      sizes: ["600×2100 mm", "900×2400 mm", "1200×2700 mm", "Custom cut"],
      thickness: ["1.2 mm", "1.5 mm", "2.0 mm"],
      applications: ["Office cabin", "Retail zoning", "Corridor partition"],
      units: ["piece", "running ft"],
      gradient: "steel",
      min: 450,
      max: 6800,
    },
    {
      base: "Commercial Glass Door",
      summary: "Full-height glazed door for high-traffic entries.",
      details:
        "Tempered glass door with steel stiles, floor spring compatible. Ideal for shops, clinics, and office lobbies. Hardware pack optional.",
      materials: ["Tempered glass + MS", "Tempered glass + SS 304"],
      finishes: ["Clear", "Frosted", "Tinted grey"],
      sizes: ["900×2100 mm", "1000×2400 mm", "1200×2400 mm"],
      thickness: ["10 mm glass", "12 mm glass"],
      applications: ["Shop front", "Office entry", "Mall kiosk"],
      units: ["piece", "set"],
      gradient: "glass",
      min: 2200,
      max: 9990,
    },
    {
      base: "Lobby Steel Screen",
      summary: "Decorative steel screen for reception lobbies.",
      details:
        "Laser-cut MS / SS screen with optional antique glass backing. Custom logo cutouts available for brand lobbies.",
      materials: ["Mild steel", "SS 304", "MS + brass accent"],
      finishes: ["Antique gold", "Black oxide", "Brushed steel"],
      sizes: ["1200×1800 mm", "1500×2400 mm", "Panel set"],
      thickness: ["2 mm", "3 mm"],
      applications: ["Reception", "Lift lobby", "Feature wall"],
      units: ["piece", "sqft"],
      gradient: "antique",
      min: 800,
      max: 9200,
    },
    {
      base: "ACP Support Channel",
      summary: "Steel channel for ACP and cladding support.",
      details:
        "Galvanised and MS channels for façade and interior ACP framing. Straight lengths with punched slots.",
      materials: ["GI", "Mild steel"],
      finishes: ["Galvanised", "Primed"],
      sizes: ["25×25 mm", "40×40 mm", "50×25 mm"],
      thickness: ["1.0 mm", "1.2 mm", "1.5 mm"],
      applications: ["ACP cladding", "False ceiling edge", "Signage frame"],
      units: ["running ft", "piece"],
      gradient: "steel",
      min: 120,
      max: 1850,
    },
  ],
  "home-interior": [
    {
      base: "Staircase Railing",
      summary: "Home staircase railing with steel + glass options.",
      details:
        "Baluster and glass-panel railing systems for duplex and villa stairs. Soft-edge profiles, wall-mount or floor-mount.",
      materials: ["SS 202", "SS 304", "MS powder coat"],
      finishes: ["Mirror polish", "Satin", "Matte black"],
      sizes: ["Running set 3 ft", "Landing panel", "Custom length"],
      thickness: ["8 mm glass", "10 mm glass", "12 mm pipe"],
      applications: ["Duplex stair", "Balcony", "Mezzanine"],
      units: ["running ft", "set"],
      gradient: "steel",
      min: 350,
      max: 7500,
    },
    {
      base: "Sliding Glass Partition",
      summary: "Space-saving sliding partition for homes.",
      details:
        "Track-mounted steel / aluminium frame with soft-close rollers. Perfect for living-dining divides and study rooms.",
      materials: ["Aluminium + glass", "MS + glass"],
      finishes: ["Anodised silver", "Matte black", "Wood laminate edge"],
      sizes: ["1800×2100 mm", "2400×2400 mm", "3-panel set"],
      thickness: ["5 mm", "8 mm", "10 mm"],
      applications: ["Living room", "Study nook", "Pooja partition"],
      units: ["set", "sqft"],
      gradient: "glass",
      min: 1800,
      max: 9800,
    },
    {
      base: "Wardrobe Glass Insert",
      summary: "Decorative glass insert for wardrobe shutters.",
      details:
        "Cut-to-size reeded, frosted, and antique glass for wardrobe and cabinet doors. Edge polished for safe handling.",
      materials: ["Float glass", "Antique glass", "Laminated glass"],
      finishes: ["Frosted", "Reeded", "Bronze antique", "Smoke"],
      sizes: ["300×900 mm", "450×1200 mm", "Custom cut"],
      thickness: ["4 mm", "5 mm", "6 mm"],
      applications: ["Wardrobe", "Kitchen shutter", "Room door insert"],
      units: ["piece", "sqft"],
      gradient: "antique",
      min: 180,
      max: 3200,
    },
    {
      base: "Kitchen Glass Backsplash",
      summary: "Toughened backsplash panels for modular kitchens.",
      details:
        "Heat-resistant toughened glass panels with optional tint and printed patterns. Ready for silicone fix.",
      materials: ["Toughened glass"],
      finishes: ["Clear", "Grey tint", "White lacquered"],
      sizes: ["600×600 mm", "900×600 mm", "Custom"],
      thickness: ["5 mm", "6 mm", "8 mm"],
      applications: ["Modular kitchen", "Breakfast counter"],
      units: ["sqft", "piece"],
      gradient: "glass",
      min: 220,
      max: 4100,
    },
  ],
  "steel-antique-glass": [
    {
      base: "Antique Glass Sheet",
      summary: "Heritage-look antique glass for windows and walls.",
      details:
        "Seeded / tinted antique glass that softens daylight. Available in full sheets and cut panels for renovation and heritage projects.",
      materials: ["Antique glass", "Textured float"],
      finishes: ["Amber", "Grey", "Green", "Clear seeded"],
      sizes: ["2×3 ft", "3×4 ft", "4×6 ft sheet"],
      thickness: ["3 mm", "4 mm", "5 mm"],
      applications: ["Window", "Feature wall", "Cabinet"],
      units: ["sqft", "sheet"],
      gradient: "antique",
      min: 160,
      max: 2800,
    },
    {
      base: "Steel Window Grille",
      summary: "Security grille with optional antique glass infill.",
      details:
        "MS window grille patterns for façades and courtyards. Can be backed with antique or frosted glass for privacy.",
      materials: ["Mild steel", "Wrought style MS"],
      finishes: ["Black oxide", "Antique gold", "Enamel"],
      sizes: ["2×3 ft", "3×4 ft", "4×5 ft"],
      thickness: ["10 mm bar", "12 mm bar"],
      applications: ["Window security", "Ventilator", "Courtyard"],
      units: ["piece", "sqft"],
      gradient: "steel",
      min: 400,
      max: 6500,
    },
    {
      base: "Elevator Cab Glass",
      summary: "Laminated antique glass for lift cabin interiors.",
      details:
        "Impact-resistant laminated antique glass with steel surround options for residential and commercial elevators.",
      materials: ["Laminated antique glass", "Steel + laminated glass"],
      finishes: ["Bronze", "Smoke", "Brushed steel edge"],
      sizes: ["Cabin side panel", "Rear wall panel", "Custom"],
      thickness: ["8.76 mm lam", "10.76 mm lam"],
      applications: ["Residential lift", "Commercial elevator"],
      units: ["piece", "set"],
      gradient: "glass",
      min: 2500,
      max: 9999,
    },
    {
      base: "Jali with Glass Backing",
      summary: "CNC jali panel with antique glass backing.",
      details:
        "Decorative jali in MS / SS with amber or clear antique glass rear panel for pooja rooms, lobbies, and façades.",
      materials: ["MS + antique glass", "SS + antique glass"],
      finishes: ["Powder coat", "Antique copper", "Matt black"],
      sizes: ["2×4 ft", "3×6 ft", "4×8 ft"],
      thickness: ["2 mm plate", "3 mm plate"],
      applications: ["Pooja room", "Façade", "Partition"],
      units: ["sqft", "piece"],
      gradient: "antique",
      min: 550,
      max: 8800,
    },
  ],
};

const stockOptions = ["In Stock", "In Stock", "In Stock", "Limited Stock", "Made to Order"];

const IMAGE_POOLS = {
  "building-interior": [
    "/products/building-01.jpg",
    "/products/building-02.jpg",
    "/products/building-03.jpg",
    "/products/building-04.jpg",
  ],
  "home-interior": [
    "/products/home-01.jpg",
    "/products/home-02.jpg",
    "/products/home-03.jpg",
    "/products/home-04.jpg",
  ],
  "steel-antique-glass": [
    "/products/steel-01.jpg",
    "/products/steel-02.jpg",
    "/products/steel-03.jpg",
    "/products/steel-04.jpg",
  ],
};

const PER_CATEGORY = 3340; // 3340 × 3 = 10,020 products

function makeProduct(categoryId, categorySlug, list, n, serial) {
  const t = pick(list, n);
  const price = priceBand(t.min, t.max, serial);
  const discountSteps = 1 + (serial % 5); // 100–500 off style
  const cappedPrice = roundHundred(price);
  const cappedMrp = roundHundred(
    Math.min(10000, cappedPrice + discountSteps * 100)
  );
  const variant = pick(
    ["Standard", "Heavy Duty", "Premium", "Economy", "Pro", "Plus", "Max"],
    n
  );
  const series = pick(["A", "B", "C", "D", "E", "F", "G", "H"], Math.floor(n / 7));
  const color = pick(t.finishes, n);
  const size = pick(t.sizes, n + 2);
  const name = `${t.base} ${variant} ${series}${100 + (n % 900)} — ${size}`;
  const images = IMAGE_POOLS[categorySlug] || IMAGE_POOLS["steel-antique-glass"];
  const imageUrl = pick(images, serial);

  return [
    categoryId,
    `GS-${String(serial).padStart(5, "0")}`,
    name,
    `${t.summary} Finish: ${color}.`,
    `${t.details} Supplied with GST invoice. Bulk / dealer rates available on MOQ. Pan-India dispatch from trading stock or made-to-order as marked. Escrow / bank advance accepted as per PI.`,
    pick(t.materials, n),
    color,
    size,
    pick(t.thickness, n),
    pick(t.applications, n),
    pick(t.units, n),
    cappedPrice,
    cappedMrp,
    pick([12, 18, 18, 18], n),
    1 + (serial % 5),
    pick(stockOptions, n),
    (40 + (serial % 10)) / 10,
    12 + ((serial * 13) % 980),
    serial <= 48 || serial % 211 === 0,
    t.gradient,
    imageUrl,
  ];
}

async function insertProductChunk(chunk) {
  const values = [];
  const params = [];
  chunk.forEach((p, idx) => {
    const base = idx * 21;
    const slots = Array.from({ length: 21 }, (_, i) => `$${base + i + 1}`);
    values.push(`(${slots.join(",")})`);
    params.push(...p);
  });

  await pool.query(
    `INSERT INTO products (
      category_id, sku, name, summary, details, material, finish,
      size_text, thickness, application, unit, price_inr, mrp_inr,
      gst_percent, moq, stock_status, rating, sold_count, featured,
      image_gradient, image_url
    ) VALUES ${values.join(",")}`,
    params
  );
}

async function seedProducts(catIds) {
  let serial = 1;
  let chunk = [];
  let total = 0;

  for (const [slug, list] of Object.entries(templates)) {
    const categoryId = catIds[slug];
    for (let n = 0; n < PER_CATEGORY; n++) {
      chunk.push(makeProduct(categoryId, slug, list, n, serial));
      serial += 1;
      total += 1;
      if (chunk.length >= 200) {
        await insertProductChunk(chunk);
        chunk = [];
        if (total % 2000 === 0) console.log(`  …inserted ${total} products`);
      }
    }
  }

  if (chunk.length) await insertProductChunk(chunk);
  return total;
}

const seed = async () => {
  await pool.query("DROP TABLE IF EXISTS products CASCADE");
  await pool.query("DROP TABLE IF EXISTS company_info CASCADE");
  await pool.query(schema);
  await pool.query("DELETE FROM categories");

  await pool.query(
    `INSERT INTO company_info
      (legal_name, short_name, tagline, about, email, phone, address, city,
       bank_name, account_name, account_number, ifsc_code, branch_name, upi_id, escrow_note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
    [
      "GLASSTEEL TRADING (OPC) PRIVATE LIMITED",
      "GLASSTEEL",
      "India's steel & glass interiors platform · 10,000+ SKUs · ₹100–₹10,000",
      "GLASSTEEL TRADING is a pan-India trading platform for building interiors, home interiors, and steel with antique glass. GST billing, bulk/dealer rates, escrow-friendly bank transfer, and dispatch for contractors, dealers, architects, and homeowners.",
      "sales@glassteel.in",
      "+91 98765 43210",
      "Industrial Area, Sector Trade Hub",
      "India",
      "HDFC Bank",
      "GLASSTEEL TRADING (OPC) PRIVATE LIMITED",
      "50200012345678",
      "HDFC0001234",
      "Trade Hub Branch, India",
      "glassteel@hdfcbank",
      "Escrow / advance: transfer only after Proforma Invoice (PI). Mention SKU + enquiry ID in narration. Funds release / balance settlement on dispatch proof or mutual confirmation. Do not share OTP. Verify IFSC & account name before paying.",
    ]
  );

  const categories = [
    [
      "building-interior",
      "Building Interior",
      "Commercial-grade finishes",
      "Partition systems, glazed doors, steel frames, and hardware for offices, retail, and institutions.",
      1,
    ],
    [
      "home-interior",
      "Home Interior",
      "Residential detailing",
      "Railings, sliding partitions, wardrobe glass, and kitchen backsplash for modern Indian homes.",
      2,
    ],
    [
      "steel-antique-glass",
      "Steel & Antique Glass",
      "Heritage meets strength",
      "Antique glass sheets, window grilles, elevator glazing, and jali panels with steel.",
      3,
    ],
  ];

  const catIds = {};
  for (const c of categories) {
    const { rows } = await pool.query(
      `INSERT INTO categories (slug, name, tagline, description, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, slug`,
      c
    );
    catIds[rows[0].slug] = rows[0].id;
  }

  console.log("Seeding 10,000+ products…");
  const total = await seedProducts(catIds);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_products_price ON products(price_inr);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
    CREATE INDEX IF NOT EXISTS idx_products_sold ON products(sold_count DESC);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
  `);

  console.log(`Database ready with ${total} products (₹100–₹10,000).`);
};

async function main() {
  try {
    await pool.query(schema);
    await pool.query(migrate);
    await seed();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
