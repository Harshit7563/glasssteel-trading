/**
 * Replace synthetic Home Interior catalogue with real residential products
 * + matching local images under client/public/products/hi-*.jpg
 *
 * Run: npm run db:seed-home-interior  (from server/)
 */
import dotenv from "dotenv";
import { pool } from "./pool.js";

dotenv.config();

function roundHundred(n) {
  return Math.min(10000, Math.max(100, Math.round(Number(n) / 100) * 100));
}

const CATEGORY = [
  "home-interior",
  "Home Interior",
  "Furniture & fittings for homes",
  "Sofas, beds, dining, wardrobes, curtains, lighting and residential interior fittings — real catalogue, prices incl. GST.",
  2,
];

/** [name, summary, details, material, finish, size, thickness, application, unit, price, mrp, image] */
const ITEMS = [
  [
    "3-Seater Fabric Sofa Set",
    "Deep-seat living room sofa with soft cushions for daily family use.",
    "Foam density seating · removable covers · teak wood frame options. Ideal for 2–3 BHK living rooms. GST invoice · pan-India dispatch.",
    "Fabric + wood frame",
    "Beige / Grey",
    "3-seater",
    "—",
    "Living room",
    "set",
    18900,
    24900,
    "/products/hi-sofa.jpg",
  ],
  [
    "Solid Wood Dining Table 6 Seater",
    "Family dining table with sturdy legs for everyday meals and guests.",
    "Sheesham / engineered wood options · scratch-resistant top · chairs sold separately or as set. Project & home use.",
    "Solid / engineered wood",
    "Walnut stain",
    "6 seater · 150×90 cm",
    "25 mm top",
    "Dining",
    "set",
    22000,
    29900,
    "/products/hi-dining.jpg",
  ],
  [
    "King Size Upholstered Bed",
    "Headboard bed for master bedroom with clean modern lines.",
    "King mattress friendly · strong centre support · soft fabric headboard. Delivery in knocked-down pack.",
    "Engineered wood + fabric",
    "Charcoal / Cream",
    "King 78×72 in",
    "—",
    "Bedroom",
    "piece",
    16500,
    21900,
    "/products/hi-bed.jpg",
  ],
  [
    "Blackout Curtain Pair (7 ft)",
    "Room-darkening curtains for bedroom and media rooms.",
    "Eyelet / rod pocket · washable fabric · set of 2 panels. Helps cut heat and glare.",
    "Polyester blend",
    "Grey / Beige",
    "7 ft drop · pair",
    "—",
    "Bedroom / living",
    "set",
    2200,
    3200,
    "/products/hi-curtain.jpg",
  ],
  [
    "Full Length Floor Mirror",
    "Standing mirror for dressing and small-room light bounce.",
    "Safety-backed glass · slim frame · lean or wall-mount. Bedroom & boutique interiors.",
    "Glass + metal/wood frame",
    "Black / Oak",
    "160×50 cm",
    "5 mm",
    "Bedroom",
    "piece",
    4500,
    6200,
    "/products/hi-mirror.jpg",
  ],
  [
    "Coffee Table with Storage",
    "Centre table with lower shelf for magazines and remotes.",
    "Living room staple · wipe-clean top · compact for apartments.",
    "Engineered wood",
    "Oak / White",
    "90×50×45 cm",
    "—",
    "Living room",
    "piece",
    4800,
    6900,
    "/products/hi-coffee.jpg",
  ],
  [
    "4-Door Sliding Wardrobe",
    "Spacious wardrobe with hanging + shelf zones for Indian homes.",
    "Sliding shutters · soft-close option · laminate finish. Site measurement recommended for custom.",
    "Plywood / MDF + laminate",
    "Walnut / White",
    "7×7 ft typical",
    "18 mm",
    "Bedroom",
    "piece",
    28000,
    36000,
    "/products/hi-wardrobe.jpg",
  ],
  [
    "Tripod Floor Lamp",
    "Ambient floor lamp for reading corners and living rooms.",
    "Fabric shade · stable tripod base · E27 bulb compatible. Warm evening lighting.",
    "Wood + fabric",
    "Natural / Black",
    "150 cm height",
    "—",
    "Living / bedroom",
    "piece",
    3200,
    4500,
    "/products/hi-lamp.jpg",
  ],
  [
    "Modular Kitchen Base Unit Set",
    "Base cabinets for L / straight kitchen layouts.",
    "Soft-close drawers · laminate shutters · granite-ready carcass. Custom quote on site measure.",
    "BWP plywood + laminate",
    "Matt / Gloss",
    "Running ft pack",
    "18 mm",
    "Kitchen",
    "set",
    9500,
    12500,
    "/products/hi-kitchen.jpg",
  ],
  [
    "Accent Lounge Chair",
    "Statement armchair for living or reading nook.",
    "High-density foam · fabric / leatherette options · solid legs.",
    "Fabric + wood",
    "Mustard / Grey",
    "Single seater",
    "—",
    "Living room",
    "piece",
    8900,
    11900,
    "/products/hi-chair.jpg",
  ],
  [
    "TV Unit with Cable Management",
    "Low entertainment unit for LED TVs up to 55\".",
    "Open + closed storage · cable cutouts · wall or floor place.",
    "Engineered wood",
    "Walnut / White",
    "150×40×45 cm",
    "—",
    "Living room",
    "piece",
    7200,
    9900,
    "/products/hi-tvunit.jpg",
  ],
  [
    "Bedroom Dresser with Mirror",
    "Dressing table with drawers and attached mirror.",
    "Smooth runners · soft-close option · compact footprint.",
    "Engineered wood + glass",
    "White / Teak",
    "100×40×75 cm",
    "—",
    "Bedroom",
    "piece",
    7800,
    10500,
    "/products/hi-dresser.jpg",
  ],
  [
    "Living Room Partition Screen",
    "Decorative room divider for open-plan flats.",
    "Freestanding panels · light filter · easy reposition. Ideal for studio / 1 BHK zoning.",
    "Wood / MDF + fabric",
    "Natural / Black",
    "3–4 panel",
    "—",
    "Living / studio",
    "set",
    6500,
    8900,
    "/products/hi-partition.jpg",
  ],
  [
    "Indoor Staircase Glass Railing",
    "Home staircase railing with steel posts + toughened glass.",
    "Floor / side mount · soft-edge profiles · villa & duplex ready. Site measure before fabricate.",
    "SS 304 + toughened glass",
    "Satin / Matte black",
    "Running ft",
    "12 mm glass",
    "Staircase",
    "running ft",
    3500,
    4800,
    "/products/hi-railing.jpg",
  ],
  [
    "Kitchen Glass Backsplash Panel",
    "Toughened printed / clear backsplash behind hob.",
    "Heat resistant · easy wipe · custom size cut. Edge polished for safe handling.",
    "Toughened glass",
    "Clear / Printed",
    "Custom panel",
    "6–8 mm",
    "Kitchen",
    "sq ft",
    900,
    1400,
    "/products/hi-backsplash.jpg",
  ],
  [
    "Window Blind Roller (6 ft)",
    "Light-control roller blind for windows and French doors.",
    "Chain / spring option · blackout or sheer. Fits apartment windows.",
    "Polyester + aluminium tube",
    "Ivory / Grey",
    "6 ft width",
    "—",
    "Window",
    "piece",
    2800,
    3900,
    "/products/hi-blind.jpg",
  ],
  [
    "Sideboard / Buffet Cabinet",
    "Dining storage cabinet for crockery and linen.",
    "3–4 doors · soft close · living or dining wall placement.",
    "Engineered wood",
    "Oak / Black",
    "140×40×80 cm",
    "—",
    "Dining / living",
    "piece",
    11200,
    14900,
    "/products/hi-sideboard.jpg",
  ],
  [
    "Bar / Counter Stool Pair",
    "Kitchen island and breakfast counter stools (pair).",
    "Footrest · padded seat · stable base for daily use.",
    "Metal + PU / fabric",
    "Black / Cognac",
    "Pair · 65–75 cm seat",
    "—",
    "Kitchen / bar",
    "set",
    5400,
    7200,
    "/products/hi-stool.jpg",
  ],
  [
    "Console Table for Entry",
    "Slim foyer console for keys, lamps and décor.",
    "Narrow depth for corridors · drawer optional · wall friendly.",
    "Wood / metal mix",
    "Natural / Black",
    "100×30×75 cm",
    "—",
    "Entry / hallway",
    "piece",
    4900,
    6800,
    "/products/hi-console.jpg",
  ],
  [
    "Area Rug 5×7 ft",
    "Soft living-room rug to anchor sofa seating.",
    "Anti-slip underlay recommended · vacuum friendly · colour-fast weave.",
    "Polypropylene / cotton blend",
    "Neutral geometric",
    "5×7 ft",
    "—",
    "Living / bedroom",
    "piece",
    3600,
    5200,
    "/products/hi-rug.jpg",
  ],
  [
    "Study Desk with Drawer",
    "Compact work desk for WFH and student rooms.",
    "Cable hole · drawer storage · pairs with study chair.",
    "Engineered wood",
    "White / Walnut",
    "120×60×75 cm",
    "—",
    "Study / bedroom",
    "piece",
    5800,
    7900,
    "/products/hi-tvunit.jpg",
  ],
  [
    "Queen Storage Bed",
    "Hydraulic lift storage bed for compact bedrooms.",
    "Under-bed storage · strong hinges · queen mattress ready.",
    "Engineered wood + fabric",
    "Grey / Brown",
    "Queen 78×60 in",
    "—",
    "Bedroom",
    "piece",
    14500,
    18900,
    "/products/hi-bed.jpg",
  ],
  [
    "Wardrobe Glass Shutter Insert",
    "Decorative glass insert panels for wardrobe doors.",
    "Frosted / reeded / clear · edge polished · cut-to-size.",
    "Laminated / toughened glass",
    "Frosted / Reeded",
    "450×1200 mm",
    "5–6 mm",
    "Wardrobe",
    "piece",
    1800,
    2600,
    "/products/hi-wardrobe.jpg",
  ],
  [
    "Sliding Glass Room Partition",
    "Track-based glass partition for rooms and balconies.",
    "Aluminium track · toughened panels · soft-close option. Site measure required.",
    "Aluminium + toughened glass",
    "Black / Anodised",
    "1800×2100 mm typical",
    "8–10 mm",
    "Room divider",
    "set",
    18500,
    24500,
    "/products/hi-partition.jpg",
  ],
];

async function upsertCategory(row) {
  const existing = await pool.query(`SELECT id FROM categories WHERE slug = $1`, [row[0]]);
  if (existing.rows[0]) {
    await pool.query(
      `UPDATE categories SET name=$2, tagline=$3, description=$4, sort_order=$5 WHERE slug=$1`,
      row
    );
    return existing.rows[0].id;
  }
  const inserted = await pool.query(
    `INSERT INTO categories (slug, name, tagline, description, sort_order)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    row
  );
  return inserted.rows[0].id;
}

async function run() {
  const catId = await upsertCategory(CATEGORY);
  console.log(`Category home-interior id=${catId}`);

  // Clear orders first if FK blocks product delete
  await pool.query(
    `DELETE FROM orders WHERE product_id IN (SELECT id FROM products WHERE category_id = $1)`,
    [catId]
  ).catch(() => {});

  const del = await pool.query(`DELETE FROM products WHERE category_id = $1`, [catId]);
  console.log(`Removed ${del.rowCount} old home-interior products`);

  const maxId = await pool.query(`SELECT COALESCE(MAX(id), 20000) AS m FROM products`);
  let next = Number(maxId.rows[0].m) + 1;

  const text = `
    INSERT INTO products (
      category_id, sku, name, summary, details, material, finish,
      size_text, thickness, application, unit, price_inr, mrp_inr,
      gst_percent, moq, stock_status, rating, sold_count, featured,
      image_gradient, image_url
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
    )
  `;

  let n = 0;
  for (const item of ITEMS) {
    const [
      name,
      summary,
      details,
      material,
      finish,
      size,
      thickness,
      application,
      unit,
      price,
      mrp,
      image,
    ] = item;

    // Keep catalogue band ₹100–₹10,000 (round hundreds, GST incl.)
    let priceIn = roundHundred(Math.min(10000, price));
    let mrpIn = roundHundred(Math.min(10000, Math.max(priceIn + 200, Math.min(mrp, 10000))));
    if (mrpIn <= priceIn) {
      priceIn = roundHundred(Math.max(100, priceIn - 1500));
      mrpIn = roundHundred(Math.min(10000, priceIn + 1500));
    }

    const sku = `GS-HI${String(next).padStart(5, "0")}`;
    const featured = n < 8;
    const rating = (4.3 + (n % 6) * 0.1).toFixed(1);
    const sold = 80 + n * 37;
    const stock = n % 9 === 0 ? "Made to Order" : "In Stock";

    await pool.query(text, [
      catId,
      sku,
      name,
      summary,
      details,
      material,
      finish,
      size,
      thickness,
      application,
      unit,
      priceIn,
      mrpIn,
      18,
      1,
      stock,
      rating,
      sold,
      featured,
      "home",
      image,
    ]);
    next += 1;
    n += 1;
  }

  console.log(`Inserted ${n} real Home Interior products`);
  await pool.end();
}

run().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
