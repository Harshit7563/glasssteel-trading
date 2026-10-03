/**
 * Replace ALL category catalogues with real products + matching local images.
 * Each product uses a UNIQUE image_url (1:1 title ↔ photo).
 *
 * Run from server/: npm run db:seed-all-real
 */
import dotenv from "dotenv";
import { pool } from "./pool.js";

dotenv.config();

function roundHundred(n) {
  return Math.min(10000, Math.max(100, Math.round(Number(n) / 100) * 100));
}

function pricePair(price, mrp) {
  let p = roundHundred(Math.min(10000, price));
  let m = roundHundred(Math.min(10000, Math.max(p + 200, Math.min(mrp, 10000))));
  if (m <= p) {
    p = roundHundred(Math.max(100, p - 1500));
    m = roundHundred(Math.min(10000, p + 1500));
  }
  return [p, m];
}

const CATEGORIES = [
  [
    "building-interior",
    "Building Interior",
    "Commercial & project interiors",
    "Office partitions, lobby glass, doors, railings and commercial interior systems — real catalogue, prices incl. GST.",
    1,
  ],
  [
    "home-interior",
    "Home Interior",
    "Furniture & fittings for homes",
    "Sofas, beds, dining, wardrobes, curtains, lighting and residential fittings — real catalogue, prices incl. GST.",
    2,
  ],
  [
    "steel-antique-glass",
    "Steel & Antique Glass",
    "Steel frames & decorative glass",
    "Steel windows, antique glass, screens, gates and decorative steel-glass systems — real catalogue, prices incl. GST.",
    3,
  ],
  [
    "steel-product",
    "Steel Product",
    "Food-grade stainless steel",
    "Cookware, dinner sets, tiffins and kitchen steel essentials — real catalogue, prices incl. GST.",
    10,
  ],
  [
    "home-decor",
    "Home Decor",
    "Style every corner",
    "Showpieces, wall art, mirrors, planters and décor accents — real catalogue, prices incl. GST.",
    11,
  ],
  [
    "building-interior-item",
    "Building Interior Item",
    "Interior finish systems",
    "Laminates, louvers, vinyl, LED profiles and interior hardware — real catalogue, prices incl. GST.",
    12,
  ],
  [
    "building-exterior",
    "Building Exterior",
    "Facade & elevation",
    "Facade cladding, HPL, ACP, louvers, decking and elevation materials — real catalogue, prices incl. GST.",
    13,
  ],
];

/** [name, summary, details, material, finish, size, thickness, application, unit, price, mrp, image] */
const CATALOGUE = {
  "building-interior": [
    ["Toughened Glass Office Partition", "Floor-to-ceiling glass partition for open offices.", "Aluminium / SS frame · frosted film option · soft-close doors available.", "Toughened glass + aluminium", "Clear / Frost", "Custom bay", "10–12 mm", "Office", "sq ft", 850, 1200, "/products/bi-partition.jpg"],
    ["Lobby Entrance Glass Door", "Swing lobby glass door with SS fittings.", "Patch fittings · floor spring compatible · logo etching optional.", "Toughened glass + SS", "Clear", "Door leaf set", "12 mm", "Lobby", "set", 9200, 10000, "/products/bi-door.jpg"],
    ["Reception Backdrop Panel", "Feature wall panel system for reception lobbies.", "Fluted / laminate options · LED cove ready.", "MDF + laminate", "Walnut / Grey", "Custom wall", "18 mm", "Reception", "sq ft", 1200, 1800, "/products/bi-reception.jpg"],
    ["Meeting Room Acoustic Partition", "Moveable acoustic partition for meeting rooms.", "Fabric finish · noise control · track options.", "Acoustic board + fabric", "Grey / Beige", "Panel set", "50–75 mm", "Meeting room", "sq ft", 1600, 2400, "/products/bi-meeting.jpg"],
    ["Commercial False Ceiling Grid", "Modular GI false ceiling system for offices.", "2×2 / 2×4 grids · mineral fibre tiles compatible.", "GI + tile", "White", "Bay pack", "—", "Ceiling", "sq ft", 200, 350, "/products/bi-ceiling.jpg"],
    ["Vinyl / SPC Office Flooring", "Click-lock commercial flooring for corridors.", "Wear layer · water resistant · wood / stone looks.", "SPC / Vinyl", "Oak / Stone", "Box ~1.5 sqm", "4–5 mm", "Flooring", "box", 2800, 3900, "/products/bi-floor.jpg"],
    ["Interior Wall Cladding Panel", "Decorative wall cladding for corridors.", "HPL / MDF fluted · concealed clips.", "HPL / MDF", "Woodgrain", "8×2 ft", "8–12 mm", "Corridor", "sheet", 2400, 3400, "/products/bi-panel.jpg"],
    ["Fire-Rated Glass Door Pack", "Fire-rated glass door for stair cores.", "Certified hardware · panic bar optional.", "Fire glass + steel frame", "Clear", "Single / double", "—", "Fire exit", "set", 10000, 10000, "/products/bi-glass.jpg"],
    ["Stainless Steel Handrail System", "Commercial staircase handrail with glass option.", "SS 304 · wall or floor mount · custom bends.", "SS 304 + glass", "Satin / Mirror", "Running ft", "—", "Staircase", "running ft", 1800, 2600, "/products/bi-handrail.jpg"],
    ["Lobby Steel Decorative Screen", "Laser-cut steel screen for brand lobbies.", "Powder coat · logo cutouts · backlight ready.", "MS / SS", "Matte black", "Panel", "3–5 mm", "Lobby", "piece", 7800, 9900, "/products/bi-lobby.jpg"],
    ["Interior Fire Exit Signage Pack", "Photoluminescent exit and direction signs.", "Code-friendly · adhesive / screw mount.", "Acrylic / aluminium", "Green/White", "Pack 12", "—", "Safety", "set", 1600, 2400, "/products/bi-corridor.jpg"],
  ],

  "home-interior": [
    ["3-Seater Fabric Sofa Set", "Deep-seat living room sofa for family use.", "Foam seating · removable covers · teak/engineered frame.", "Fabric + wood", "Beige / Grey", "3-seater", "—", "Living room", "set", 10000, 10000, "/products/hi-sofa.jpg"],
    ["Solid Wood Dining Table 6 Seater", "Family dining table for everyday meals.", "Sheesham / engineered options · chairs optional.", "Solid / engineered wood", "Walnut", "6 seater", "25 mm", "Dining", "set", 10000, 10000, "/products/hi-dining.jpg"],
    ["King Size Upholstered Bed", "Headboard bed for master bedroom.", "King mattress friendly · strong centre support.", "Engineered wood + fabric", "Charcoal", "King 78×72 in", "—", "Bedroom", "piece", 10000, 10000, "/products/hi-bed.jpg"],
    ["Blackout Curtain Pair (7 ft)", "Room-darkening curtains for bedrooms.", "Eyelet · washable · set of 2 panels.", "Polyester blend", "Grey / Beige", "7 ft pair", "—", "Bedroom", "set", 2200, 3200, "/products/hi-curtain.jpg"],
    ["Full Length Floor Mirror", "Standing mirror for dressing areas.", "Safety-backed glass · slim frame.", "Glass + frame", "Black / Oak", "160×50 cm", "5 mm", "Bedroom", "piece", 4500, 6200, "/products/hi-mirror.jpg"],
    ["Coffee Table with Storage", "Centre table with lower shelf.", "Wipe-clean top · compact apartment size.", "Engineered wood", "Oak / White", "90×50×45 cm", "—", "Living room", "piece", 4800, 6900, "/products/hi-coffee.jpg"],
    ["4-Door Sliding Wardrobe", "Spacious wardrobe with hanging + shelves.", "Sliding shutters · laminate · soft-close option.", "Plywood / MDF + laminate", "Walnut / White", "7×7 ft", "18 mm", "Bedroom", "piece", 10000, 10000, "/products/hi-wardrobe.jpg"],
    ["Tripod Floor Lamp", "Ambient floor lamp for reading corners.", "Fabric shade · E27 compatible.", "Wood + fabric", "Natural / Black", "150 cm", "—", "Living room", "piece", 3200, 4500, "/products/hi-lamp.jpg"],
    ["Modular Kitchen Base Unit Set", "Base cabinets for L / straight kitchens.", "Soft-close · laminate shutters · granite-ready.", "BWP plywood + laminate", "Matt / Gloss", "Running ft pack", "18 mm", "Kitchen", "set", 9500, 10000, "/products/hi-kitchen.jpg"],
    ["Accent Lounge Chair", "Statement armchair for living nook.", "High-density foam · fabric / leatherette.", "Fabric + wood", "Mustard / Grey", "Single", "—", "Living room", "piece", 8900, 10000, "/products/hi-chair.jpg"],
    ["TV Unit with Cable Management", "Low entertainment unit for LED TVs.", "Open + closed storage · cable cutouts.", "Engineered wood", "Walnut", "150×40×45 cm", "—", "Living room", "piece", 7200, 9900, "/products/hi-tvunit.jpg"],
    ["Bedroom Dresser with Mirror", "Dressing table with drawers and mirror.", "Smooth runners · compact footprint.", "Engineered wood + glass", "White / Teak", "100×40×75 cm", "—", "Bedroom", "piece", 7800, 10000, "/products/hi-dresser.jpg"],
    ["Window Blind Roller (6 ft)", "Light-control roller blind for windows.", "Blackout or sheer · chain option.", "Polyester + aluminium", "Ivory / Grey", "6 ft", "—", "Window", "piece", 2800, 3900, "/products/hi-blind.jpg"],
    ["Bar / Counter Stool Pair", "Kitchen island breakfast stools (pair).", "Footrest · padded seat.", "Metal + PU", "Black / Cognac", "Pair", "—", "Kitchen", "set", 5400, 7200, "/products/hi-stool.jpg"],
    ["Area Rug 5×7 ft", "Living-room rug to anchor seating.", "Vacuum friendly · colour-fast weave.", "Poly / cotton blend", "Neutral", "5×7 ft", "—", "Living", "piece", 3600, 5200, "/products/hi-rug.jpg"],
    ["Kitchen Glass Backsplash Panel", "Toughened backsplash behind hob.", "Heat resistant · custom size · edge polished.", "Toughened glass", "Clear / Printed", "Custom", "6–8 mm", "Kitchen", "sq ft", 900, 1400, "/products/hi-backsplash.jpg"],
  ],

  "steel-antique-glass": [
    ["Steel Casement Window", "Powder-coated steel casement window.", "Multi-point lock · mosquito mesh option · custom sizes.", "MS / SS + glass", "Powder coat", "Custom", "—", "Window", "sq ft", 900, 1400, "/products/sg-window.jpg"],
    ["Ornate Steel Gate Single Leaf", "Decorative main gate with steel scroll work.", "Manual / automation ready · powder coat.", "MS", "Matte black", "Single leaf", "—", "Entrance", "piece", 10000, 10000, "/products/sg-gate.jpg"],
    ["Laser Cut Steel Screen Panel", "Decorative steel jali / screen panel.", "CNC pattern · powder coat · backlight ready.", "MS / SS", "Black / Brass tone", "Panel", "3–5 mm", "Partition / facade", "piece", 6500, 8800, "/products/sg-screen.jpg"],
    ["Antique Glass Cabinet Door Set", "Cabinet shutters with antique / reeded glass.", "Edge polished · wardrobe & display units.", "Antique glass + frame", "Bronze antique", "Pair", "5 mm", "Furniture", "set", 3200, 4500, "/products/sg-antique.jpg"],
    ["Steel Balcony Railing with Glass", "Balcony railing with steel posts + glass.", "Side / top mount · villa & apartment ready.", "SS / MS + glass", "Satin / Black", "Running ft", "10–12 mm", "Balcony", "running ft", 2400, 3400, "/products/sg-railing.jpg"],
    ["Window Steel Grill Safety", "Safety grill for windows with clean verticals.", "Welded / modular · custom pitch.", "MS", "Powder coat", "Custom", "—", "Window safety", "sq ft", 400, 700, "/products/sg-grill.jpg"],
    ["Reeded Glass Partition Panel", "Vertical reeded glass for soft privacy.", "Edge polished · aluminium channel mount.", "Reeded glass", "Clear reeded", "Panel", "6–8 mm", "Partition", "sq ft", 950, 1400, "/products/sg-panel.jpg"],
    ["Steel French Door with Glass", "Full-height steel French door with toughened panels.", "Side / top lights optional · matte black popular.", "MS + toughened glass", "Matte black", "Door set", "—", "Living / balcony", "set", 10000, 10000, "/products/sg-door.jpg"],
    ["Steel Door Frame with Glass Lite", "Steel door frame with glazed vision panel.", "Office / utility · fire option available.", "Steel + glass", "Powder coat", "Frame + lite", "—", "Door", "set", 4800, 6500, "/products/sg-frame.jpg"],
    ["Antique Mirror Panel", "Aged-look mirror panel for feature walls.", "Safety film · custom cut · edge polish.", "Antique mirror glass", "Silver antique", "Panel", "5 mm", "Feature wall", "sq ft", 1100, 1600, "/products/sg-mirror.jpg"],
  ],

  "steel-product": [
    ["Triply SS Pressure Cooker 5L", "Outer-lid triply cooker for family cooking.", "Induction friendly · food-grade steel · GST invoice.", "SS 304 Triply", "Mirror", "5 Ltr", "Triply", "Kitchen", "piece", 4500, 6000, "/products/sp-cooker.jpg"],
    ["Triply SS Fry Pan 24 cm", "Everyday triply fry pan.", "Quick heat · stay-cool handle style.", "SS Triply", "Satin", "24 cm", "Triply", "Kitchen", "piece", 2000, 2600, "/products/sp-pan.jpg"],
    ["Triply SS Kadhai 26 cm", "Heavy-duty triply kadhai with steel lid.", "3.3 L · gas & induction.", "SS Triply", "Steel lid", "26 cm", "Triply", "Kitchen", "piece", 3000, 3900, "/products/sp-kadhai.jpg"],
    ["Triply Sauce Pot 3.2L", "Sauce pot with cover for soups and curries.", "Even heat · induction safe.", "SS Triply", "Steel cover", "20 cm / 3.2 L", "Triply", "Kitchen", "piece", 2600, 3400, "/products/sp-casserole.jpg"],
    ["SS Dinner Set 24 Pcs", "Family dining set for 4 persons.", "Rust free · dishwasher friendly polish.", "SS 202", "Laser polish", "24 pcs", "Heavy", "Dining", "set", 3500, 4400, "/products/sp-dinner.jpg"],
    ["SS Vacuum Tiffin 3 Box", "Office vacuum steel tiffin.", "Leak resistant · light carry.", "SS 202", "Matte", "3 box", "0.5 mm", "Lunch", "piece", 1100, 1400, "/products/sp-tiffin.jpg"],
    ["SS Tea Kettle 1.5L", "Whistling / pour kettle for daily chai.", "Induction base · cool handle.", "SS", "Mirror", "1.5 L", "—", "Kitchen", "piece", 1200, 1700, "/products/sp-kettle.jpg"],
    ["SS Mixing Bowl Set (3)", "Nesting steel bowls for prep and serving.", "Pour rim · stackable.", "SS 202", "Mirror", "Set of 3", "—", "Kitchen", "set", 900, 1300, "/products/sp-bowl.jpg"],
    ["SS Dinner Set 18 Pcs", "Compact dinner kit for 2 persons.", "Food grade · daily use.", "SS 202", "Mirror", "18 pcs", "Heavy", "Dining", "set", 2900, 3600, "/products/sp-set.jpg"],
    ["Triply SS Pressure Cooker 2L", "Compact triply cooker for small kitchens.", "Induction · daily dal-rice loads.", "SS 304 Triply", "Mirror", "2 Ltr", "Triply", "Kitchen", "piece", 3300, 4400, "/products/steel-cook-01.jpg"],
    ["Solitaire Kadhai Glass Lid 4L", "Sandwich kadhai with glass lid.", "Bakelite handles · daily use.", "SS", "Glass lid", "26 cm / 4 L", "Sandwich", "Kitchen", "piece", 1600, 2000, "/products/steel-cook-02.jpg"],
  ],

  "home-decor": [
    ["Ceramic Table Showpiece Vase", "Statement ceramic vase for living shelves.", "Hand-finished look · dry flower ready.", "Ceramic", "Matte ivory", "Medium", "—", "Living room", "piece", 800, 1200, "/products/hd-vase.jpg"],
    ["Wall Mirror Round 24 in", "Light-bouncing round wall mirror.", "Beveled edge · wall mount kit.", "Glass + frame", "Black / Gold", "24 inch", "4 mm", "Living / hallway", "piece", 2800, 4200, "/products/hd-mirror.jpg"],
    ["Canvas Wall Art Set (3)", "Gallery wall set for feature walls.", "Ready to hang · fade-resistant print.", "Canvas", "Printed", "Set of 3", "—", "Living / bedroom", "set", 2200, 3500, "/products/hd-art.jpg"],
    ["Wall Clock Modern Dial", "Silent sweep wall clock.", "Large numerals · battery operated.", "ABS + glass", "Matte", "12 inch", "—", "Living", "piece", 900, 1500, "/products/hd-clock.jpg"],
    ["Metal Wall Shelf Pair", "Floating shelves for décor and books.", "Powder-coated brackets.", "MS + wood look", "Walnut / Black", "Pair", "—", "Living / study", "set", 1600, 2400, "/products/hd-shelf.jpg"],
    ["Artificial Plant in Planter", "Low-maintenance greenery for corners.", "UV-stable leaves · ceramic pot.", "Plastic + ceramic", "Green", "Medium", "—", "Living / balcony", "piece", 700, 1100, "/products/hd-plant.jpg"],
    ["Scented Candle Jar Duo", "Cosy evening fragrance pair.", "Soy blend · glass jars.", "Glass + wax", "Amber", "2 jars", "—", "Bedroom / living", "set", 600, 900, "/products/hd-candle.jpg"],
    ["Photo Frame Gallery (4)", "Mixed-size photo frame cluster.", "Table + wall use.", "MDF + glass", "Black", "Set of 4", "—", "Living / bedroom", "set", 1100, 1700, "/products/hd-frame.jpg"],
    ["Decorative Figurine Pair", "Shelf figurines for console styling.", "Resin cast · matte paint.", "Resin", "Ivory / Gold", "Pair", "—", "Living", "set", 1000, 1600, "/products/hd-sculpture.jpg"],
    ["Cushion Cover Set (4)", "Soft throw covers for sofa styling.", "Zippered · washable covers.", "Cotton / linen blend", "Assorted", "16×16 in", "—", "Living", "set", 900, 1400, "/products/hd-pillow.jpg"],
    ["Table Lamp Ceramic Base", "Bedside / console table lamp.", "Fabric shade · warm light.", "Ceramic + fabric", "Ivory", "Medium", "—", "Bedroom", "piece", 1800, 2600, "/products/hd-lamp.jpg"],
  ],

  "building-interior-item": [
    ["Interior Laminate Sheet", "HPL laminate for cabinetry and cladding.", "High abrasion · wood / solid colours.", "HPL", "Woodgrain", "8×4 ft", "1 mm", "Cabinets", "sheet", 1800, 2800, "/products/bii-laminate.jpg"],
    ["Interior Louver Panel Set", "Vertical louvers for cabins and receptions.", "Modular clips · laminate finish.", "MDF / WPC", "Walnut", "Set 4", "—", "Commercial", "set", 4500, 6500, "/products/bii-louver.jpg"],
    ["Office Partition Hardware Kit", "Hardware pack for glass office partitions.", "Floor spring compatible · SS finish.", "SS 304", "Brushed", "Kit", "—", "Office", "set", 3200, 4800, "/products/bii-handle.jpg"],
    ["Acoustic Wall Baffle", "Fabric acoustic baffle for meeting rooms.", "Noise control · modern look.", "Foam + fabric", "Grey", "Panel", "50 mm", "Office", "piece", 2800, 3900, "/products/bii-acoustic.jpg"],
    ["False Ceiling Grid Channel", "GI channel for modular ceilings.", "Straight lengths · site ready.", "GI", "Galvanised", "12 ft", "0.5 mm", "Ceiling", "piece", 200, 400, "/products/bii-ceiling.jpg"],
    ["Skirting Profile PVC", "Flexible skirting for interiors.", "Impact resistant · paint match.", "PVC", "White", "8 ft", "—", "Floor edge", "piece", 300, 500, "/products/bii-skirting.jpg"],
    ["Interior LED Profile Cove", "Aluminium cove profile for indirect lighting.", "Diffuser included · 2 m.", "Aluminium", "Anodised", "2 m", "—", "Ceiling / wall", "piece", 700, 1100, "/products/bii-led.jpg"],
    ["Interior Vinyl Floor Plank", "Click-lock vinyl plank box.", "Water resistant · wood look.", "SPC / Vinyl", "Oak", "Box ~1.5 sqm", "4 mm", "Flooring", "box", 2400, 3600, "/products/bii-vinyl.jpg"],
  ],

  "building-exterior": [
    ["Exterior HPL Facade Sheet", "UV-stable HPL for large elevations.", "Moisture sealed · colour stable · low maintenance.", "Exterior HPL", "Solid / wood", "8×4 ft", "6 mm", "Facade", "sheet", 4800, 7200, "/products/be-facade.jpg"],
    ["NFC Exterior Cladding Board", "Waterproof natural fibre composite board.", "No swell · termite resistant · balcony & soffit.", "NFC", "Wood tone", "8×1 ft", "16 mm", "Cladding", "piece", 3200, 4800, "/products/be-cladding.jpg"],
    ["Stone Veneer Panel Opaque", "Natural stone look with reduced dead load.", "Weather resistant · elevation & boundary walls.", "Stone veneer", "Natural", "Panel", "—", "Elevation", "piece", 2800, 4200, "/products/be-stone.jpg"],
    ["Metal Louver Blade Set", "Sun-control metal louvers for elevations.", "Shading + ventilation · powder coat.", "Aluminium / MS", "Powder coat", "Set 6", "—", "Facade screen", "set", 4200, 6500, "/products/be-louver.jpg"],
    ["Exterior Decking Plank", "Slip-resistant outdoor decking plank.", "Terrace & poolside · moisture stable.", "WPC / Composite", "Teak look", "2.4 m", "—", "Terrace", "piece", 1200, 1900, "/products/be-deck.jpg"],
    ["Pergola Section Kit", "Exterior pergola framing sections.", "Pairs with decking & cladding.", "MS / Alu", "Matte black", "Kit", "—", "Outdoor", "set", 7800, 9900, "/products/be-pergola.jpg"],
    ["ACP Exterior Sheet PVDF", "PVDF coated ACP for commercial elevations.", "Colour fast · lightweight.", "ACP", "PVDF colour", "8×4 ft", "4 mm", "Facade", "sheet", 3600, 5400, "/products/be-acp.jpg"],
    ["Exterior Balcony Front Panel", "Ready panel for balcony front cladding.", "HPL / NFC option · cut sizes.", "HPL / NFC", "Graphite", "Custom", "—", "Balcony", "piece", 2600, 3900, "/products/be-balcony.jpg"],
  ],
};

async function upsertCategory(row) {
  const existing = await pool.query(`SELECT id FROM categories WHERE slug = $1`, [row[0]]);
  if (existing.rows[0]) {
    await pool.query(
      `UPDATE categories SET name=$2, tagline=$3, description=$4, sort_order=$5 WHERE slug=$1`,
      row
    );
    return existing.rows[0].id;
  }
  const { rows } = await pool.query(
    `INSERT INTO categories (slug, name, tagline, description, sort_order)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    row
  );
  return rows[0].id;
}

async function replaceCategoryProducts(slug, items) {
  const { rows } = await pool.query(`SELECT id FROM categories WHERE slug = $1`, [slug]);
  if (!rows[0]) throw new Error(`Missing category ${slug}`);
  const catId = rows[0].id;

  await pool
    .query(
      `DELETE FROM orders WHERE product_id IN (SELECT id FROM products WHERE category_id = $1)`,
      [catId]
    )
    .catch(() => {});

  const del = await pool.query(`DELETE FROM products WHERE category_id = $1`, [catId]);
  console.log(`  ${slug}: removed ${del.rowCount}`);

  // Guard: no duplicate image_url inside a category batch
  const seen = new Set();
  for (const it of items) {
    if (seen.has(it[11])) {
      throw new Error(`Duplicate image in ${slug}: ${it[11]}`);
    }
    seen.add(it[11]);
  }

  let serial = (await pool.query(`SELECT COALESCE(MAX(id), 0)::int AS m FROM products`)).rows[0]
    .m;

  const insertSql = `
    INSERT INTO products (
      category_id, sku, name, summary, details, material, finish,
      size_text, thickness, application, unit, price_inr, mrp_inr,
      gst_percent, moq, stock_status, rating, sold_count, featured,
      image_gradient, image_url
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,18,1,$14,$15,$16,$17,$18,$19
    )`;

  let n = 0;
  for (const it of items) {
    serial += 1;
    const [price, mrp] = pricePair(it[9], it[10]);
    const sku = `GS-R${String(serial).padStart(5, "0")}`;
    const stock = n % 8 === 0 ? "Made to Order" : "In Stock";
    const rating = (4.3 + (n % 6) * 0.1).toFixed(1);
    const sold = 50 + n * 41;
    const featured = n < 4;

    await pool.query(insertSql, [
      catId,
      sku,
      it[0],
      it[1],
      `${it[2]} Prices incl. GST. Pan-India dispatch.`,
      it[3],
      it[4],
      it[5],
      it[6],
      it[7],
      it[8],
      price,
      mrp,
      stock,
      rating,
      sold,
      featured,
      slug.split("-")[0],
      it[11],
    ]);
    n += 1;
  }
  console.log(`  ${slug}: inserted ${n}`);
  return n;
}

async function main() {
  try {
    // Global uniqueness across whole catalogue
    const allImgs = Object.values(CATALOGUE).flatMap((items) => items.map((i) => i[11]));
    const dup = allImgs.filter((x, i) => allImgs.indexOf(x) !== i);
    if (dup.length) {
      throw new Error(`Duplicate image_url across catalogue: ${[...new Set(dup)].join(", ")}`);
    }

    console.log("Upserting categories…");
    for (const c of CATEGORIES) {
      const id = await upsertCategory(c);
      console.log(`  ${c[1]} → ${id}`);
    }

    console.log("\nReplacing products with matched image catalogue…");
    let total = 0;
    for (const [slug, items] of Object.entries(CATALOGUE)) {
      total += await replaceCategoryProducts(slug, items);
    }

    const counts = await pool.query(
      `SELECT c.slug, c.name, COUNT(p.id)::int AS products
       FROM categories c LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id ORDER BY c.sort_order, c.id`
    );
    console.log("\nCatalogue summary:");
    for (const r of counts.rows) {
      console.log(`  ${r.name}: ${r.products}`);
    }
    console.log(`\nDone. ${total} products — each with a unique matching image.`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
