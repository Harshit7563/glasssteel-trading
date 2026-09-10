/**
 * Additive seed — keeps existing products, adds 4 categories + catalogue items
 * inspired by Vinod Steel, Pepperfry Home Decor, and exterior facade materials.
 */
import dotenv from "dotenv";
import { pool } from "./pool.js";

dotenv.config();

function roundHundred(n) {
  return Math.min(10000, Math.max(100, Math.round(Number(n) / 100) * 100));
}

const NEW_CATEGORIES = [
  [
    "steel-product",
    "Steel Product",
    "Food-grade stainless steel",
    "Stainless steel cookware, dinner sets, tiffins and kitchen essentials inspired by trusted Indian steel brands.",
    10,
  ],
  [
    "home-decor",
    "Home Decor",
    "Style every corner",
    "Showpieces, wall art, mirrors, vases, planters and décor accents for modern Indian homes.",
    11,
  ],
  [
    "building-interior-item",
    "Building Interior Item",
    "Interior finish systems",
    "Interior cladding, louvers, laminates, partitions and commercial interior surface solutions.",
    12,
  ],
  [
    "building-exterior",
    "Building Exterior",
    "Facade & elevation",
    "Exterior cladding, HPL, NFC boards, stone veneers, metal louvers and elevation materials.",
    13,
  ],
];

const CATALOGUE = {
  "steel-product": {
    images: [
      "/products/steel-01.jpg",
      "/products/steel-02.jpg",
      "/products/steel-03.jpg",
      "/products/steel-04.jpg",
    ],
    gradient: "steel",
    items: [
      ["Triply SS Pressure Cooker 2L", "Titanium triply stainless steel pressure cooker, induction friendly.", "Outer lid · food-grade steel · daily cooking essential.", "SS 304 Triply", "Mirror polish", "2 Ltr", "2.5 mm", "Kitchen", "piece", 3300, 4400],
      ["Triply SS Kadhai 26 cm", "Heavy-duty triply kadhai with steel lid for curries and frying.", "Induction friendly · long-term durability · 3.3 L capacity.", "SS Triply", "Steel lid", "26 cm / 3.3 L", "Triply", "Kitchen", "piece", 3000, 3900],
      ["Triply SS Fry Pan 24 cm", "Everyday triply fry pan with quick heating base.", "Gas & induction · durable handle · daily sabzi & eggs.", "SS Triply", "Satin", "24 cm", "Triply", "Kitchen", "piece", 2000, 2600],
      ["Triply Sauce Pot 3.2L", "Premium triply sauce pot with cover for soups and curries.", "Family meals · even heat · induction safe.", "SS Triply", "Steel cover", "20 cm / 3.2 L", "Triply", "Kitchen", "piece", 2600, 3400],
      ["Triply SS Wok 26 cm", "Seamless wok for stir-fry and everyday cooking.", "Fast heating · 3.3 L · induction friendly.", "SS Triply", "Natural", "26 cm", "Triply", "Kitchen", "piece", 2300, 3100],
      ["Triply Milk Pan 2.2L", "Milk and tea pan with premium triply base.", "Induction safe · pour spout friendly.", "SS Triply", "Mirror", "18 cm / 2.2 L", "Triply", "Kitchen", "piece", 1900, 2600],
      ["SS Vacuum Tiffin 3 Box", "Office-ready vacuum sealed steel tiffin.", "3 compartments · leak resistant · light carry.", "SS 202", "Matte", "3 box", "0.5 mm", "Lunch", "piece", 1100, 1400],
      ["SS Lunch Box 2 Compartment", "Airtight steel lunch box for office and school.", "No-mess meals · stays fresh longer.", "SS 202", "Colour lid", "2 compartment", "0.4 mm", "Lunch", "piece", 1000, 1200],
      ["SS 3-in-1 Compartment Plate (2)", "Smart portion plates for pav bhaji and breakfast.", "Pack of 2 · rust-free · round edges.", "SS 202", "Mirror", "Pack of 2", "0.6 mm", "Dining", "set", 800, 1100],
      ["SS Dinner Set 18 Pcs", "Compact family dinner kit with polished finish.", "2 persons · dishwasher safe · food grade.", "SS 202", "Laser polish", "18 pcs", "Heavy gauge", "Dining", "set", 2900, 3600],
      ["SS Dinner Set 24 Pcs", "Family dining set for 4 persons.", "Rust free · long lasting shine.", "SS 202", "Polished", "24 pcs", "Heavy gauge", "Dining", "set", 3500, 4400],
      ["SS Dinner Set 30 Pcs", "Tough polished steel set for small families.", "4 persons · daily + guests.", "SS 202", "Mirror", "30 pcs", "Heavy gauge", "Dining", "set", 4600, 5800],
      ["SS Insulated Casserole 750 ml", "Hot casserole with glass lid and heat retention.", "Wooden-style handles · keeps rotis warm.", "SS Insulated", "Glass lid", "750 ml", "Double wall", "Serving", "piece", 1100, 1400],
      ["Sandwich Bottom Kadhai 3.5L", "Induction-friendly sandwich bottom kadhai.", "Stay-cool handles · easy clean.", "SS Sandwich", "Steel lid", "24 cm / 3.5 L", "Sandwich", "Kitchen", "piece", 1600, 2100],
      ["Multi Kadhai 6 Plates", "6-in-1 kadhai for idli, dhokla and momos.", "Sandwich base · space saver.", "SS", "Steel", "6 plates", "Sandwich", "Kitchen", "set", 3700, 4600],
      ["Hammered Baby Spoon Set 12", "Premium hammered finish baby spoons.", "Mirror polish · rust free.", "SS", "Hammered", "12 pcs", "Standard", "Tableware", "set", 500, 600],
      ["Hammered Baby Fork Set 12", "Snack serving forks with mirror polish.", "Daily use · gift ready.", "SS", "Hammered", "12 pcs", "Standard", "Tableware", "set", 700, 800],
      ["Premium Sauce Pan 675 ml", "Heavy gauge milk/tea pan induction compatible.", "Dishwasher safe · soft pour.", "SS", "Natural", "675 ml", "Heavy", "Kitchen", "piece", 500, 700],
      ["Triply Pressure Cooker 5L", "Outer lid cooker for family cooking.", "Induction friendly · food grade.", "SS Triply", "Silver", "5 Ltr", "Triply", "Kitchen", "piece", 4500, 6000],
      ["Solitaire Kadhai Glass Lid 4L", "Sandwich bottom kadhai with glass lid.", "Bakelite handles · daily use.", "SS", "Glass lid", "26 cm / 4 L", "Sandwich", "Kitchen", "piece", 1600, 2000],
    ],
  },
  "home-decor": {
    images: [
      "/products/home-01.jpg",
      "/products/home-02.jpg",
      "/products/home-03.jpg",
      "/products/home-04.jpg",
    ],
    gradient: "antique",
    items: [
      ["Ceramic Table Showpiece", "Statement ceramic accent for living shelves.", "Hand-finished look · gift ready · under centre table friendly.", "Ceramic", "Matte ivory", "Medium", "—", "Living room", "piece", 800, 1200],
      ["Decorative Floor Vase", "Tall vase for empty corners and entry foyers.", "Modern silhouette · dry flower ready.", "Ceramic/Glass", "Sand glaze", "Large", "—", "Living room", "piece", 2500, 3900],
      ["Wall Mirror Round 24 in", "Light-bouncing mirror for compact homes.", "Beveled edge · wall mount kit.", "Glass + frame", "Black/Gold", "24 inch", "4 mm", "Living / hallway", "piece", 2800, 4200],
      ["Canvas Wall Art Set (3)", "Gallery wall set for feature walls.", "Ready to hang · fade-resistant print.", "Canvas", "Printed", "Set of 3", "—", "Living / bedroom", "set", 2200, 3500],
      ["Wall Clock Modern Dial", "Silent sweep wall clock for living rooms.", "Large numerals · battery operated.", "ABS + glass", "Matte", "12 inch", "—", "Living room", "piece", 900, 1500],
      ["Metal Wall Shelf Pair", "Floating shelves for décor and books.", "Powder-coated steel brackets.", "MS + wood look", "Walnut/Black", "Pair", "—", "Living / study", "set", 1600, 2400],
      ["Artificial Plant in Planter", "Low-maintenance greenery for corners.", "UV-stable leaves · ceramic pot.", "Plastic + ceramic", "Green", "Medium", "—", "Balcony / living", "piece", 700, 1100],
      ["Planter Pot Set (3)", "Nested planters for indoor greens.", "Drainage ready · modern shapes.", "Fibre clay", "Terracotta tone", "Set of 3", "—", "Gardening", "set", 1200, 1800],
      ["Brass Spiritual Diya Set", "Festive and daily pooja diya set.", "Vastu-friendly · polish finish.", "Brass", "Antique gold", "Set of 4", "—", "Pooja", "set", 900, 1400],
      ["Scented Candle Jar Duo", "Cosy evening fragrance pair.", "Soy blend · glass jars.", "Glass + wax", "Amber", "2 jars", "—", "Bedroom / living", "set", 600, 900],
      ["Photo Frame Gallery (4)", "Mixed-size photo frame cluster.", "Table + wall use.", "MDF + glass", "Black", "Set of 4", "—", "Living / bedroom", "set", 1100, 1700],
      ["Decorative Figurine Pair", "Shelf figurines for console styling.", "Resin cast · matte paint.", "Resin", "Ivory/Gold", "Pair", "—", "Living room", "set", 1000, 1600],
      ["Wall Décor Metal Art", "Laser-cut metal wall accent.", "Indoor use · easy hang.", "MS powder coat", "Black", "Large", "2 mm", "Feature wall", "piece", 2100, 3200],
      ["Table Centrepiece Tray", "Serving/display tray for coffee table.", "Mirror base · steel rim.", "SS + glass", "Chrome", "Medium", "—", "Living / dining", "piece", 1300, 1900],
      ["Outdoor Patio Lantern", "Weather-friendly decorative lantern.", "LED candle compatible.", "Metal + glass", "Black", "Tall", "—", "Balcony", "piece", 1500, 2300],
      ["Artificial Flower Bouquet", "Ready bouquet for vase fills.", "No water · fade resistant.", "Fabric", "Multicolour", "Bouquet", "—", "Home", "piece", 500, 800],
      ["Pooja Toran Festive", "Door toran for festivals.", "Handmade beads · reusable.", "Fabric/beads", "Red-gold", "Standard", "—", "Entrance", "piece", 400, 700],
      ["Kids Room Wall Stickers", "Peel-and-stick décor pack for kids rooms.", "Removable · non-toxic ink.", "Vinyl", "Printed", "Pack", "—", "Kids room", "set", 300, 500],
      ["Statement Floor Mirror", "Full-length leaner mirror.", "Safety film glass · stand.", "Glass + wood", "Oak/Black", "Large", "5 mm", "Bedroom", "piece", 5500, 7800],
      ["Curated Décor Gift Box", "Housewarming décor gift combo.", "Candle + frame + mini vase.", "Mixed", "Assorted", "Gift box", "—", "Gifting", "set", 1800, 2500],
    ],
  },
  "building-interior-item": {
    images: [
      "/products/building-01.jpg",
      "/products/building-02.jpg",
      "/products/building-03.jpg",
      "/products/building-04.jpg",
    ],
    gradient: "glass",
    items: [
      ["MDF Fluted Wall Panel", "Fluted MDF panel for office and hospitality interiors.", "Paint-ready · acoustic look · easy install.", "MDF", "Raw / primed", "8×2 ft", "12 mm", "Feature wall", "sheet", 2200, 3200],
      ["Interior Laminate Sheet", "Trending laminate for cabinetry and wall cladding.", "High abrasion · easy clean.", "HPL", "Woodgrain", "8×4 ft", "1 mm", "Cabinets / walls", "sheet", 1800, 2800],
      ["Interior Louver Panel Set", "Vertical louvers for reception and cabin walls.", "Modular clips · paint/laminate finish.", "MDF/WPC", "Walnut", "Set 4", "—", "Commercial interior", "set", 4500, 6500],
      ["Office Partition Hardware Kit", "Hardware pack for glass office partitions.", "Floor spring compatible · SS finish.", "SS 304", "Brushed", "Kit", "—", "Office", "set", 3200, 4800],
      ["Acoustic Wall Baffle", "Fabric acoustic baffle for meeting rooms.", "Noise control · modern look.", "Foam + fabric", "Grey", "Panel", "50 mm", "Office", "piece", 2800, 3900],
      ["Interior Glass Film Frosted", "Frosted film for cabin privacy.", "DIY install · glare cut.", "PVC film", "Frost", "Roll 5 m", "—", "Cabin / washroom", "roll", 900, 1400],
      ["False Ceiling Grid Channel", "GI channel for modular false ceilings.", "Straight lengths · site ready.", "GI", "Galvanised", "12 ft", "0.5 mm", "Ceiling", "piece", 200, 400],
      ["Skirting Profile PVC", "Flexible skirting for interiors.", "Impact resistant · paint match.", "PVC", "White", "8 ft", "—", "Floor edge", "piece", 300, 500],
      ["Door Closer Heavy Duty", "Commercial door closer for high traffic.", "Adjustable speed · metal body.", "Steel", "Silver", "Unit", "—", "Doors", "piece", 1600, 2400],
      ["Interior LED Profile Cove", "Aluminium cove profile for indirect lighting.", "Diffuser included.", "Aluminium", "Anodised", "2 m", "—", "Ceiling / wall", "piece", 700, 1100],
      ["Reception Desk Laminate Top", "Counter laminate top blank for fit-outs.", "Scratch resistant.", "HPL on board", "Stone look", "Custom cut", "18 mm", "Reception", "piece", 4800, 7200],
      ["Wall Panelling Clip System", "Concealed clip system for wall panels.", "Fast install · reusable.", "MS/Alu", "Black", "Pack 50", "—", "Panelling", "set", 1200, 1800],
      ["Interior ACP Sheet", "Interior-grade ACP for columns and bulkheads.", "Lightweight · clean joints.", "ACP", "Solid colour", "8×4 ft", "3 mm", "Retail / office", "sheet", 2100, 3100],
      ["Glass Railing Bracket Set", "Spigot brackets for indoor glass railings.", "SS 304 · floor mount.", "SS 304", "Mirror", "Set 4", "—", "Staircase", "set", 3500, 5200],
      ["Soft-Close Drawer Channel", "Full extension soft-close channels.", "Pair · 450 mm.", "Steel", "Zinc", "Pair", "—", "Furniture", "set", 600, 900],
      ["Interior Vinyl Floor Plank", "Click-lock vinyl plank sample pack.", "Water resistant · wood look.", "SPC/Vinyl", "Oak", "Box ~1.5 sqm", "4 mm", "Flooring", "box", 2400, 3600],
      ["Column Cladding Kit", "Ready kit for square column wraps.", "Laminate + edge band.", "MDF + laminate", "Grey", "Kit", "—", "Lobby", "set", 3900, 5800],
      ["Meeting Room Whiteboard Panel", "Magnetic whiteboard wall panel.", "Write-erase · mount kit.", "Steel enamel", "White", "4×3 ft", "—", "Office", "piece", 4200, 6100],
      ["Cable Management Raceway", "Wall raceway for fit-out cabling.", "Snap cover · paintable.", "PVC", "White", "2 m", "—", "Office", "piece", 200, 400],
      ["Interior Handle Bar Set", "Long bar handles for cabinetry.", "SS finish · screws included.", "SS", "Brushed", "Set 10", "—", "Furniture", "set", 1100, 1700],
    ],
  },
  "building-exterior": {
    images: [
      "/products/building-03.jpg",
      "/products/steel-02.jpg",
      "/products/building-01.jpg",
      "/products/steel-04.jpg",
    ],
    gradient: "steel",
    items: [
      ["Exterior HPL Facade Sheet", "UV-stable HPL for large elevations.", "Moisture sealed · colour stable · low maintenance.", "Exterior HPL", "Solid/wood", "8×4 ft", "6 mm", "Facade", "sheet", 4800, 7200],
      ["NFC Exterior Cladding Board", "Waterproof natural fibre composite board.", "No swell · termite resistant · balcony & soffit ready.", "NFC", "Wood tone", "8×1 ft", "16 mm", "Cladding", "piece", 3200, 4800],
      ["Stone Veneer Panel Opaque", "Natural stone look with reduced dead load.", "Weather resistant · elevation & boundary walls.", "Stone veneer", "Natural", "Panel", "—", "Elevation", "piece", 2800, 4200],
      ["Translucent Stone Veneer", "Backlit-capable thin stone veneer.", "Premium hospitality facades · light diffusion.", "Stone veneer", "Onyx look", "Panel", "—", "Feature elevation", "piece", 5500, 8200],
      ["Exterior Alabaster Sheet", "UV-treated alabaster for illuminated portals.", "Night identity · outdoor stable.", "Alabaster sheet", "Warm white", "Sheet", "—", "Entrance / signage", "sheet", 6100, 9000],
      ["Flexistone Exterior Cladding", "Flexible stone-look cladding for curves.", "Paintable · moisture stable.", "Flexistone", "Paintable", "Roll/panel", "—", "Feature facade", "sqft", 900, 1500],
      ["PU Rock Accent Panel", "Lightweight rugged stone texture panel.", "Easy install · café & retail fronts.", "PU", "Rock texture", "Panel", "—", "Accent wall", "piece", 1800, 2700],
      ["Metal Louver Blade Set", "Sun-control metal louvers for elevations.", "Shading + ventilation · powder coat.", "Aluminium/MS", "Powder coat", "Set 6", "—", "Facade screen", "set", 4200, 6500],
      ["Exterior Decking Plank", "Slip-resistant outdoor decking plank.", "Terrace & poolside · moisture stable.", "WPC/Composite", "Teak look", "2.4 m", "—", "Terrace", "piece", 1200, 1900],
      ["Pergola Section Kit", "Exterior pergola framing sections.", "Pairs with decking & cladding.", "MS/Alu", "Matte black", "Kit", "—", "Outdoor", "set", 7800, 9900],
      ["ACP Exterior Sheet PVDF", "PVDF coated ACP for commercial elevations.", "Colour fast · lightweight.", "ACP", "PVDF colour", "8×4 ft", "4 mm", "Facade", "sheet", 3600, 5400],
      ["Exterior Flashing Profile", "Aluminium flashing for facade joints.", "Water shedding detail.", "Aluminium", "Mill/anodised", "3 m", "—", "Detailing", "piece", 500, 800],
      ["Facade Fixing Bracket Pack", "Hidden fixing brackets for cladding.", "Stainless fasteners included.", "SS/MS", "Zinc", "Pack 20", "—", "Install", "set", 1400, 2100],
      ["Boundary Wall Cladding Pack", "Starter pack for compound wall upgrades.", "Veneer + adhesive guidance.", "Mixed", "Stone look", "Pack", "—", "Boundary", "set", 4500, 6800],
      ["Exterior Balcony Front Panel", "Ready panel for balcony front cladding.", "HPL/NFC option · cut sizes.", "HPL/NFC", "Graphite", "Custom", "—", "Balcony", "piece", 2600, 3900],
      ["Sunshade Fin Module", "Vertical elevation fin module.", "Heat gain reduction.", "Aluminium", "Powder coat", "Module", "—", "High-rise", "piece", 3300, 4900],
      ["Exterior Sealant Exterior Grade", "Facade joint sealant cartridge pack.", "UV resistant · paintable skin.", "Silicone/PU", "Grey", "Pack 12", "—", "Joints", "set", 2400, 3200],
      ["Roof Edge Coping Cap", "Metal coping for parapet edges.", "Clean termination detail.", "GI/Alu", "Powder coat", "3 m", "—", "Parapet", "piece", 900, 1400],
      ["Storefront Cladding Kit", "Retail storefront elevation kit.", "ACP + trim + fixings.", "ACP kit", "Brand colour", "Kit", "—", "Retail", "set", 8500, 10000],
      ["Elevation Sample Board Set", "Physical sample board for facade selection.", "HPL + NFC + veneer chips.", "Mixed samples", "Assorted", "Board", "—", "Specification", "set", 1500, 2200],
    ],
  },
};

async function upsertCategory(row) {
  const existing = await pool.query(`SELECT id FROM categories WHERE slug = $1`, [
    row[0],
  ]);
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

async function insertProducts(categoryId, slug, pack) {
  const existing = await pool.query(
    `SELECT COUNT(*)::int AS c FROM products WHERE category_id = $1`,
    [categoryId]
  );
  if (existing.rows[0].c > 0) {
    console.log(`  skip ${slug}: already has ${existing.rows[0].c} products`);
    return 0;
  }

  let serialBase = (
    await pool.query(`SELECT COALESCE(MAX(id), 0)::int AS m FROM products`)
  ).rows[0].m;

  let added = 0;
  for (let i = 0; i < pack.items.length; i++) {
    const it = pack.items[i];
    const price = roundHundred(it[9]);
    const mrp = roundHundred(Math.max(price + 100, it[10]));
    serialBase += 1;
    const sku = `GS-N${String(serialBase).padStart(5, "0")}`;
    const image = pack.images[i % pack.images.length];

    await pool.query(
      `INSERT INTO products (
        category_id, sku, name, summary, details, material, finish,
        size_text, thickness, application, unit, price_inr, mrp_inr,
        gst_percent, moq, stock_status, rating, sold_count, featured,
        image_gradient, image_url
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,18,1,'In Stock',$14,$15,$16,$17,$18
      )`,
      [
        categoryId,
        sku,
        it[0],
        it[1],
        `${it[2]} Prices incl. GST. Sourced for Indian project & home needs.`,
        it[3],
        it[4],
        it[5],
        it[6],
        it[7],
        it[8],
        price,
        mrp,
        (42 + (i % 8)) / 10,
        20 + i * 7,
        i < 4,
        pack.gradient,
        image,
      ]
    );
    added += 1;
  }
  return added;
}

async function main() {
  try {
    console.log("Adding categories (keeping existing)…");
    const ids = {};
    for (const c of NEW_CATEGORIES) {
      ids[c[0]] = await upsertCategory(c);
      console.log(`  category ${c[1]} → id ${ids[c[0]]}`);
    }

    let total = 0;
    for (const [slug, pack] of Object.entries(CATALOGUE)) {
      const n = await insertProducts(ids[slug], slug, pack);
      console.log(`  +${n} products in ${slug}`);
      total += n;
    }

    const counts = await pool.query(
      `SELECT c.name, COUNT(p.id)::int AS products
       FROM categories c LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id ORDER BY c.sort_order, c.id`
    );
    console.log("\nCatalogue summary:");
    for (const r of counts.rows) {
      console.log(`  ${r.name}: ${r.products}`);
    }
    console.log(`\nDone. Added ${total} new products.`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
