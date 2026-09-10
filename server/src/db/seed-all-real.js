/**
 * Replace ALL category catalogues with real products + local images.
 * Keeps categories; deletes old products per category; inserts ~20–24 each.
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
    ["Toughened Glass Office Partition", "Floor-to-ceiling glass partition for open offices.", "Aluminium / SS frame · frosted film option · soft-close doors available. Site measure required.", "Toughened glass + aluminium", "Clear / Frost", "Custom bay", "10–12 mm", "Office", "sq ft", 850, 1200, "/products/bi-partition.jpg"],
    ["Lobby Entrance Glass Door", "Automatic / swing lobby glass door pack.", "Patch fittings · floor spring compatible · brand logo etching optional.", "Toughened glass + SS", "Clear", "Door leaf set", "12 mm", "Lobby", "set", 9200, 10000, "/products/bi-door.jpg"],
    ["Reception Backdrop Panel", "Feature wall panel system for reception lobbies.", "Fluted / laminate options · LED cove ready · modular install.", "MDF + laminate", "Walnut / Grey", "Custom wall", "18 mm", "Reception", "sq ft", 1200, 1800, "/products/bi-reception.jpg"],
    ["Meeting Room Acoustic Partition", "Moveable / fixed acoustic partition for meeting rooms.", "Fabric finish · noise control · track options.", "Acoustic board + fabric", "Grey / Beige", "Panel set", "50–75 mm", "Meeting room", "sq ft", 1600, 2400, "/products/bi-meeting.jpg"],
    ["Commercial False Ceiling Grid", "Modular GI false ceiling system for offices.", "2×2 / 2×4 grids · mineral fibre tiles compatible.", "GI + tile", "White", "Bay pack", "—", "Ceiling", "sq ft", 200, 350, "/products/bi-ceiling.jpg"],
    ["Vinyl / SPC Office Flooring", "Click-lock commercial flooring for corridors and cabins.", "Wear layer · water resistant · wood / stone looks.", "SPC / Vinyl", "Oak / Stone", "Box ~1.5 sqm", "4–5 mm", "Flooring", "box", 2800, 3900, "/products/bi-floor.jpg"],
    ["Interior Wall Cladding Panel", "Decorative wall cladding for corridors and lifts lobbies.", "HPL / MDF fluted · concealed clips.", "HPL / MDF", "Woodgrain", "8×2 ft", "8–12 mm", "Corridor", "sheet", 2400, 3400, "/products/bi-panel.jpg"],
    ["Fire-Rated Glass Door Pack", "Fire-rated glass door for stair core and exit paths.", "Certified hardware · panic bar optional · project supply.", "Fire glass + steel frame", "Clear", "Single / double", "—", "Fire exit", "set", 10000, 10000, "/products/bi-glass.jpg"],
    ["Stainless Steel Handrail System", "Commercial staircase / lobby handrail with glass infill option.", "SS 304 · wall or floor mount · custom bends.", "SS 304 + glass", "Satin / Mirror", "Running ft", "—", "Staircase", "running ft", 1800, 2600, "/products/bi-handrail.jpg"],
    ["Cabin Glass Door with Film", "Privacy cabin door with frosted film banding.", "Patch / hinge options · soft close · lock set.", "Toughened glass", "Frost band", "900×2100 mm", "10 mm", "Cabin", "set", 6500, 8500, "/products/bi-door.jpg"],
    ["Corridor Glass Railing", "Side-corridor glass railing for atriums.", "Spigot / channel mount · polished edges.", "Toughened glass + SS", "Clear", "Running ft", "12 mm", "Atrium", "running ft", 2200, 3200, "/products/bi-handrail.jpg"],
    ["Lobby Steel Decorative Screen", "Laser-cut steel screen for brand lobbies.", "Powder coat · logo cutouts · backlight ready.", "MS / SS", "Matte black", "Panel", "3–5 mm", "Lobby", "piece", 7800, 9900, "/products/bi-lobby.jpg"],
    ["Washroom Cubicle Partition", "Compact laminate cubicle system for washrooms.", "SS hardware · privacy latch · easy clean.", "Compact laminate", "Solid colour", "Cubicle bay", "12 mm", "Washroom", "bay", 9200, 10000, "/products/bi-panel.jpg"],
    ["Aluminium Sliding Door Interior", "Wide sliding door for board rooms and showrooms.", "Soft-close track · clear / tinted glass.", "Aluminium + glass", "Anodised / Black", "1800×2400 mm", "—", "Board room", "set", 10000, 10000, "/products/bi-glass.jpg"],
    ["Lift Lobby Stone Cladding Kit", "Thin stone / laminate cladding kit for lift walls.", "Lightweight · quick install · premium look.", "Stone veneer / HPL", "Marble look", "Kit", "—", "Lift lobby", "set", 8500, 10000, "/products/bi-lobby.jpg"],
    ["Office Workstation Glass Screen", "Desktop / mid-height glass privacy screen.", "Clamp mount · frosted strip · cable friendly.", "Toughened glass", "Frost strip", "1200×400 mm", "8 mm", "Workstation", "piece", 1800, 2600, "/products/bi-partition.jpg"],
    ["Commercial Skirting Profile Pack", "Aluminium / PVC skirting for project interiors.", "Impact resistant · colour match options.", "Aluminium / PVC", "Silver / White", "Pack 20 pcs", "—", "Floor edge", "set", 2400, 3400, "/products/bi-floor.jpg"],
    ["LED Cove Lighting Profile Set", "Aluminium cove profiles with diffuser for lobbies.", "Warm / cool LED ready · 2 m lengths.", "Aluminium", "Anodised", "Set 10 × 2 m", "—", "Ceiling cove", "set", 4200, 5800, "/products/bi-ceiling.jpg"],
    ["Double Glazed Unit Office Window", "DGU window for cabin noise control.", "Aluminium frame · argon option · project size.", "Aluminium + glass", "Powder coat", "Custom", "24–28 mm", "Cabin window", "sq ft", 1100, 1600, "/products/bi-glass.jpg"],
    ["Access Floor Panel System", "Raised access floor for IT floors and labs.", "Steel cementitious · anti-static option.", "Steel + cement", "Epoxy", "600×600 mm", "—", "Server / office", "sq ft", 900, 1400, "/products/bi-floor.jpg"],
    ["Interior Fire Exit Signage Pack", "Photoluminescent exit and direction signs.", "Code-friendly · adhesive / screw mount.", "Acrylic / aluminium", "Green/White", "Pack 12", "—", "Safety", "set", 1600, 2400, "/products/bi-corridor.jpg"],
    ["Column Cladding Interior Kit", "Square / round column wrap for lobbies.", "Laminate + edge · site cut guidance.", "MDF + laminate", "Grey / Wood", "Kit", "18 mm", "Lobby column", "set", 5400, 7200, "/products/bi-panel.jpg"],
    ["Boardroom Table Glass Top", "Toughened glass top for conference tables.", "Polished edges · optional logo etch.", "Toughened glass", "Clear / Tint", "Custom", "12 mm", "Boardroom", "piece", 8800, 10000, "/products/bi-meeting.jpg"],
    ["Commercial Door Closer Heavy Duty", "Floor / overhead closer for high-traffic doors.", "Adjustable speed · metal body · project supply.", "Steel", "Silver", "Unit", "—", "Doors", "piece", 2200, 3200, "/products/bi-door.jpg"],
  ],

  "home-interior": [
    ["3-Seater Fabric Sofa Set", "Deep-seat living room sofa for daily family use.", "Foam seating · removable covers · teak/engineered frame options.", "Fabric + wood", "Beige / Grey", "3-seater", "—", "Living room", "set", 10000, 10000, "/products/hi-sofa.jpg"],
    ["Solid Wood Dining Table 6 Seater", "Family dining table for everyday meals and guests.", "Sheesham / engineered options · chairs optional as set.", "Solid / engineered wood", "Walnut", "6 seater", "25 mm", "Dining", "set", 10000, 10000, "/products/hi-dining.jpg"],
    ["King Size Upholstered Bed", "Headboard bed for master bedroom.", "King mattress friendly · strong centre support.", "Engineered wood + fabric", "Charcoal", "King 78×72 in", "—", "Bedroom", "piece", 10000, 10000, "/products/hi-bed.jpg"],
    ["Blackout Curtain Pair (7 ft)", "Room-darkening curtains for bedroom and media rooms.", "Eyelet · washable · set of 2 panels.", "Polyester blend", "Grey / Beige", "7 ft pair", "—", "Bedroom", "set", 2200, 3200, "/products/hi-curtain.jpg"],
    ["Full Length Floor Mirror", "Standing mirror for dressing areas.", "Safety-backed glass · slim frame.", "Glass + frame", "Black / Oak", "160×50 cm", "5 mm", "Bedroom", "piece", 4500, 6200, "/products/hi-mirror.jpg"],
    ["Coffee Table with Storage", "Centre table with lower shelf.", "Wipe-clean top · compact apartment size.", "Engineered wood", "Oak / White", "90×50×45 cm", "—", "Living room", "piece", 4800, 6900, "/products/hi-coffee.jpg"],
    ["4-Door Sliding Wardrobe", "Spacious wardrobe with hanging + shelf zones.", "Sliding shutters · laminate finish · soft-close option.", "Plywood / MDF + laminate", "Walnut / White", "7×7 ft", "18 mm", "Bedroom", "piece", 10000, 10000, "/products/hi-wardrobe.jpg"],
    ["Tripod Floor Lamp", "Ambient floor lamp for reading corners.", "Fabric shade · E27 compatible.", "Wood + fabric", "Natural / Black", "150 cm", "—", "Living room", "piece", 3200, 4500, "/products/hi-lamp.jpg"],
    ["Modular Kitchen Base Unit Set", "Base cabinets for L / straight kitchens.", "Soft-close · laminate shutters · granite-ready.", "BWP plywood + laminate", "Matt / Gloss", "Running ft pack", "18 mm", "Kitchen", "set", 9500, 10000, "/products/hi-kitchen.jpg"],
    ["Accent Lounge Chair", "Statement armchair for living or reading nook.", "High-density foam · fabric / leatherette.", "Fabric + wood", "Mustard / Grey", "Single", "—", "Living room", "piece", 8900, 10000, "/products/hi-chair.jpg"],
    ["TV Unit with Cable Management", "Low entertainment unit for LED TVs up to 55\".", "Open + closed storage · cable cutouts.", "Engineered wood", "Walnut", "150×40×45 cm", "—", "Living room", "piece", 7200, 9900, "/products/hi-tvunit.jpg"],
    ["Bedroom Dresser with Mirror", "Dressing table with drawers and mirror.", "Smooth runners · compact footprint.", "Engineered wood + glass", "White / Teak", "100×40×75 cm", "—", "Bedroom", "piece", 7800, 10000, "/products/hi-dresser.jpg"],
    ["Living Room Partition Screen", "Decorative room divider for open-plan flats.", "Freestanding · light filter · easy move.", "Wood / MDF + fabric", "Natural", "3–4 panel", "—", "Living", "set", 6500, 8900, "/products/hi-partition.jpg"],
    ["Indoor Staircase Glass Railing", "Home staircase railing with steel + glass.", "Floor / side mount · villa & duplex ready.", "SS 304 + toughened glass", "Satin / Black", "Running ft", "12 mm", "Staircase", "running ft", 3500, 4800, "/products/hi-railing.jpg"],
    ["Kitchen Glass Backsplash Panel", "Toughened backsplash behind hob.", "Heat resistant · custom size · edge polished.", "Toughened glass", "Clear / Printed", "Custom", "6–8 mm", "Kitchen", "sq ft", 900, 1400, "/products/hi-backsplash.jpg"],
    ["Window Blind Roller (6 ft)", "Light-control roller blind for windows.", "Blackout or sheer · chain option.", "Polyester + aluminium", "Ivory / Grey", "6 ft", "—", "Window", "piece", 2800, 3900, "/products/hi-blind.jpg"],
    ["Sideboard / Buffet Cabinet", "Dining storage for crockery and linen.", "Soft close · 3–4 doors.", "Engineered wood", "Oak / Black", "140×40×80 cm", "—", "Dining", "piece", 10000, 10000, "/products/hi-sideboard.jpg"],
    ["Bar / Counter Stool Pair", "Kitchen island breakfast stools (pair).", "Footrest · padded seat.", "Metal + PU", "Black / Cognac", "Pair", "—", "Kitchen", "set", 5400, 7200, "/products/hi-stool.jpg"],
    ["Console Table for Entry", "Slim foyer console for keys and lamps.", "Narrow depth · drawer optional.", "Wood / metal", "Natural / Black", "100×30×75 cm", "—", "Entry", "piece", 4900, 6800, "/products/hi-console.jpg"],
    ["Area Rug 5×7 ft", "Living-room rug to anchor seating.", "Vacuum friendly · colour-fast weave.", "Poly / cotton blend", "Neutral", "5×7 ft", "—", "Living", "piece", 3600, 5200, "/products/hi-rug.jpg"],
    ["Study Desk with Drawer", "Compact WFH / student desk.", "Cable hole · drawer storage.", "Engineered wood", "White / Walnut", "120×60×75 cm", "—", "Study", "piece", 5800, 7900, "/products/hi-tvunit.jpg"],
    ["Queen Storage Bed", "Hydraulic lift storage bed.", "Under-bed storage · queen ready.", "Engineered wood + fabric", "Grey / Brown", "Queen", "—", "Bedroom", "piece", 10000, 10000, "/products/hi-bed.jpg"],
    ["Wardrobe Glass Shutter Insert", "Decorative glass inserts for wardrobe doors.", "Frosted / reeded · cut-to-size.", "Laminated glass", "Frosted", "450×1200 mm", "5–6 mm", "Wardrobe", "piece", 1800, 2600, "/products/hi-wardrobe.jpg"],
    ["Sliding Glass Room Partition", "Track glass partition for rooms and balconies.", "Aluminium track · toughened panels.", "Aluminium + glass", "Black", "1800×2100 mm", "8–10 mm", "Room divider", "set", 10000, 10000, "/products/hi-partition.jpg"],
  ],

  "steel-antique-glass": [
    ["Steel Casement Window", "Powder-coated steel casement window for homes and villas.", "Multi-point lock · mosquito mesh option · custom sizes.", "MS / SS + glass", "Powder coat", "Custom", "—", "Window", "sq ft", 900, 1400, "/products/sg-window.jpg"],
    ["Steel French Door with Glass", "Full-height steel French door with toughened panels.", "Side / top lights optional · matte black popular.", "MS + toughened glass", "Matte black", "Door set", "—", "Living / balcony", "set", 10000, 10000, "/products/sg-door.jpg"],
    ["Laser Cut Steel Screen Panel", "Decorative steel jali / screen for lobbies and courtyards.", "CNC pattern · powder coat · backlight ready.", "MS / SS", "Black / Brass tone", "Panel", "3–5 mm", "Partition / facade", "piece", 6500, 8800, "/products/sg-screen.jpg"],
    ["Antique Glass Cabinet Door Set", "Cabinet shutters with antique / reeded glass inserts.", "Edge polished · wardrobe & display units.", "Antique glass + frame", "Bronze antique", "Pair", "5 mm", "Furniture", "set", 3200, 4500, "/products/sg-antique.jpg"],
    ["Steel Balcony Railing with Glass", "Balcony railing system with steel posts + glass.", "Side / top mount · villa & apartment ready.", "SS / MS + glass", "Satin / Black", "Running ft", "10–12 mm", "Balcony", "running ft", 2400, 3400, "/products/sg-railing.jpg"],
    ["Ornate Steel Gate Single Leaf", "Decorative main gate with steel scroll work.", "Manual / automation ready · powder coat.", "MS", "Matte black", "Single leaf", "—", "Entrance", "piece", 10000, 10000, "/products/sg-gate.jpg"],
    ["Window Steel Grill Safety", "Safety grill for windows with clean verticals.", "Welded / modular · custom pitch.", "MS", "Powder coat", "Custom", "—", "Window safety", "sq ft", 400, 700, "/products/sg-grill.jpg"],
    ["Antique Mirror Panel", "Aged-look mirror panel for feature walls and bars.", "Safety film · custom cut · edge polish.", "Antique mirror glass", "Silver antique", "Panel", "5 mm", "Feature wall", "sq ft", 1100, 1600, "/products/sg-mirror.jpg"],
    ["Steel Door Frame with Glass Lite", "Steel door frame with glazed vision panel.", "Office / utility · fire option available.", "Steel + glass", "Powder coat", "Frame + lite", "—", "Door", "set", 4800, 6500, "/products/sg-frame.jpg"],
    ["Reeded Glass Partition Panel", "Vertical reeded glass for soft privacy.", "Edge polished · aluminium channel mount.", "Reeded glass", "Clear reeded", "Panel", "6–8 mm", "Partition", "sq ft", 950, 1400, "/products/sg-panel.jpg"],
    ["Stained / Coloured Antique Glass", "Decorative coloured antique glass for windows and doors.", "Lead / copper foil options · custom motifs.", "Antique glass", "Multi colour", "Panel", "3–5 mm", "Feature window", "sq ft", 1800, 2600, "/products/sg-antique.jpg"],
    ["Steel Sliding Window Twin Track", "Twin-track steel sliding window with mesh track.", "Powder coat · mosquito mesh · roller bearings.", "MS + glass", "White / Black", "Custom", "—", "Window", "sq ft", 750, 1100, "/products/sg-window.jpg"],
    ["Steel + Glass Entrance Canopy", "Small entrance canopy with steel frame and glass.", "Villa / boutique · drain detail guidance.", "MS + laminated glass", "Black", "Custom", "—", "Entrance", "set", 10000, 10000, "/products/sg-door.jpg"],
    ["Decorative Steel Baluster Set", "Ornate balusters for staircase renovations.", "Cast / fabricated · powder coat.", "MS / SS", "Black / Gold tone", "Set 10", "—", "Staircase", "set", 5500, 7500, "/products/sg-railing.jpg"],
    ["Steel Window Awning System", "Top-hung steel awning window for washrooms and kitchens.", "Friction stay · insect screen option.", "MS + glass", "Powder coat", "Custom", "—", "Utility", "sq ft", 850, 1300, "/products/sg-window.jpg"],
    ["Antique Glass Wardrobe Insert Pack", "Cut-to-size antique glass for wardrobe shutters.", "Edge polish · packing for furniture factories.", "Antique glass", "Bronze / Grey", "Pack 4", "5 mm", "Furniture OEM", "set", 4200, 5800, "/products/sg-antique.jpg"],
    ["Steel Pivot Door Glass", "Pivot steel door with large glass lite.", "Heavy pivot · soft seal · statement entry.", "MS + toughened glass", "Matte black", "Door", "—", "Entrance", "set", 10000, 10000, "/products/sg-door.jpg"],
    ["Steel Courtyard Screen Gate", "Laser screen integrated courtyard gate.", "Privacy + airflow · powder coat.", "MS", "Graphite", "Gate leaf", "—", "Courtyard", "piece", 9200, 10000, "/products/sg-screen.jpg"],
    ["Toughened Glass Steel Handrail", "Continuous steel handrail with glass infill.", "Indoor / outdoor · custom bends.", "SS + glass", "Satin", "Running ft", "12 mm", "Staircase", "running ft", 2800, 3900, "/products/sg-railing.jpg"],
    ["Steel Louvre Window Pack", "Adjustable steel louvre window for ventilation.", "Glass / aluminium blades · powder coat frame.", "MS + glass/alu", "Powder coat", "Unit", "—", "Utility", "piece", 3600, 4900, "/products/sg-grill.jpg"],
    ["Bevelled Antique Mirror Frame", "Framed bevelled antique mirror for living walls.", "Ready hang · distressed frame options.", "Glass + wood/metal", "Antique gold", "Medium / Large", "5 mm", "Living", "piece", 4800, 6800, "/products/sg-mirror.jpg"],
    ["Steel Glass Railing Spigot Set", "Floor-mount spigots for glass railing installs.", "SS 304 · pack with fasteners.", "SS 304", "Mirror / Satin", "Set 6", "—", "Install", "set", 5200, 7200, "/products/sg-railing.jpg"],
    ["Factory Steel Window Industrial", "Industrial-style steel window for cafés and lofts.", "Grid muntins · clear / textured glass.", "MS + glass", "Black", "Custom", "—", "Retail / loft", "sq ft", 1000, 1500, "/products/sg-frame.jpg"],
    ["Decorative Glass Transom Panel", "Transom / fanlight decorative glass panel.", "Antique / etched designs · custom arch.", "Decorative glass", "Etched / Coloured", "Panel", "5 mm", "Entrance", "piece", 3900, 5500, "/products/sg-panel.jpg"],
  ],

  "steel-product": [
    ["Triply SS Pressure Cooker 5L", "Outer-lid triply cooker for family cooking.", "Induction friendly · food-grade steel · GST invoice.", "SS 304 Triply", "Mirror", "5 Ltr", "Triply", "Kitchen", "piece", 4500, 6000, "/products/sp-cooker.jpg"],
    ["Triply SS Pressure Cooker 2L", "Compact triply cooker for small kitchens.", "Induction · daily dal-rice loads.", "SS 304 Triply", "Mirror", "2 Ltr", "Triply", "Kitchen", "piece", 3300, 4400, "/products/steel-cook-01.jpg"],
    ["Triply SS Kadhai 26 cm", "Heavy-duty triply kadhai with steel lid.", "3.3 L · gas & induction.", "SS Triply", "Steel lid", "26 cm", "Triply", "Kitchen", "piece", 3000, 3900, "/products/sp-kadhai.jpg"],
    ["Triply SS Fry Pan 24 cm", "Everyday triply fry pan.", "Quick heat · stay-cool handle style.", "SS Triply", "Satin", "24 cm", "Triply", "Kitchen", "piece", 2000, 2600, "/products/sp-pan.jpg"],
    ["Triply Sauce Pot 3.2L", "Sauce pot with cover for soups and curries.", "Even heat · induction safe.", "SS Triply", "Steel cover", "20 cm / 3.2 L", "Triply", "Kitchen", "piece", 2600, 3400, "/products/sp-casserole.jpg"],
    ["SS Dinner Set 24 Pcs", "Family dining set for 4 persons.", "Rust free · dishwasher friendly polish.", "SS 202", "Laser polish", "24 pcs", "Heavy", "Dining", "set", 3500, 4400, "/products/sp-dinner.jpg"],
    ["SS Dinner Set 18 Pcs", "Compact dinner kit for 2 persons.", "Food grade · daily use.", "SS 202", "Mirror", "18 pcs", "Heavy", "Dining", "set", 2900, 3600, "/products/sp-set.jpg"],
    ["SS Dinner Set 30 Pcs", "Extended set for small families and guests.", "Polished finish · gift ready.", "SS 202", "Mirror", "30 pcs", "Heavy", "Dining", "set", 4600, 5800, "/products/sp-dinner.jpg"],
    ["SS Vacuum Tiffin 3 Box", "Office vacuum steel tiffin.", "Leak resistant · light carry.", "SS 202", "Matte", "3 box", "0.5 mm", "Lunch", "piece", 1100, 1400, "/products/sp-tiffin.jpg"],
    ["SS Lunch Box 2 Compartment", "Airtight lunch box for office and school.", "No-mess · stays fresh longer.", "SS 202", "Colour lid", "2 compartment", "0.4 mm", "Lunch", "piece", 1000, 1200, "/products/sp-tiffin.jpg"],
    ["SS Insulated Casserole 750 ml", "Hot casserole with heat retention.", "Keeps rotis warm · glass lid option.", "SS Insulated", "Glass lid", "750 ml", "Double wall", "Serving", "piece", 1100, 1400, "/products/sp-casserole.jpg"],
    ["SS Mixing Bowl Set (3)", "Nesting steel bowls for prep and serving.", "Pour rim · stackable.", "SS 202", "Mirror", "Set of 3", "—", "Kitchen", "set", 900, 1300, "/products/sp-bowl.jpg"],
    ["SS Tea Kettle 1.5L", "Whistling / pour kettle for daily chai.", "Induction base · cool handle.", "SS", "Mirror", "1.5 L", "—", "Kitchen", "piece", 1200, 1700, "/products/sp-kettle.jpg"],
    ["Sandwich Bottom Kadhai 3.5L", "Induction sandwich-bottom kadhai.", "Stay-cool handles · easy clean.", "SS Sandwich", "Steel lid", "24 cm / 3.5 L", "Sandwich", "Kitchen", "piece", 1600, 2100, "/products/sp-kadhai.jpg"],
    ["SS 3-in-1 Compartment Plate (2)", "Portion plates for breakfast and snacks.", "Pack of 2 · round edges.", "SS 202", "Mirror", "Pack of 2", "0.6 mm", "Dining", "set", 800, 1100, "/products/sp-bowl.jpg"],
    ["Triply Milk Pan 2.2L", "Milk and tea pan with triply base.", "Induction · soft pour.", "SS Triply", "Mirror", "18 cm / 2.2 L", "Triply", "Kitchen", "piece", 1900, 2600, "/products/sp-pan.jpg"],
    ["Multi Kadhai 6 Plates", "6-in-1 kadhai for idli, dhokla, momos.", "Sandwich base · space saver.", "SS", "Steel", "6 plates", "Sandwich", "Kitchen", "set", 3700, 4600, "/products/sp-set.jpg"],
    ["Hammered Spoon & Fork Set 24", "Hammered finish cutlery for daily table.", "Rust free · gift box ready.", "SS", "Hammered", "24 pcs", "—", "Tableware", "set", 1400, 1900, "/products/sp-dinner.jpg"],
    ["SS Serving Platter Oval", "Large oval platter for parties.", "Polished · easy clean.", "SS 202", "Mirror", "Large", "—", "Serving", "piece", 900, 1300, "/products/sp-bowl.jpg"],
    ["Premium Sauce Pan 675 ml", "Heavy gauge milk/tea pan.", "Induction · dishwasher safe.", "SS", "Natural", "675 ml", "Heavy", "Kitchen", "piece", 500, 700, "/products/sp-kettle.jpg"],
    ["SS Water Bottle 1L", "Leak-proof steel bottle for office and gym.", "Single wall · easy sip.", "SS 202", "Matte", "1 L", "—", "Travel", "piece", 400, 600, "/products/sp-tiffin.jpg"],
    ["Triply Wok 26 cm", "Seamless wok for stir-fry.", "Fast heating · induction.", "SS Triply", "Natural", "26 cm", "Triply", "Kitchen", "piece", 2300, 3100, "/products/sp-pan.jpg"],
    ["SS Storage Container Set (4)", "Airtight steel storage for kitchen shelves.", "Nesting lids · rust free.", "SS", "Clear lid", "Set of 4", "—", "Storage", "set", 1600, 2200, "/products/sp-set.jpg"],
    ["Solitaire Kadhai Glass Lid 4L", "Sandwich kadhai with glass lid.", "Bakelite handles · daily use.", "SS", "Glass lid", "26 cm / 4 L", "Sandwich", "Kitchen", "piece", 1600, 2000, "/products/steel-cook-02.jpg"],
  ],

  "home-decor": [
    ["Ceramic Table Showpiece", "Statement ceramic accent for living shelves.", "Hand-finished look · gift ready.", "Ceramic", "Matte ivory", "Medium", "—", "Living room", "piece", 800, 1200, "/products/hd-vase.jpg"],
    ["Decorative Floor Vase Tall", "Tall vase for empty corners and foyers.", "Dry flower ready · modern silhouette.", "Ceramic / glass", "Sand glaze", "Large", "—", "Living", "piece", 2500, 3900, "/products/hd-vase.jpg"],
    ["Wall Mirror Round 24 in", "Light-bouncing round mirror.", "Beveled edge · wall mount kit.", "Glass + frame", "Black / Gold", "24 inch", "4 mm", "Living / hallway", "piece", 2800, 4200, "/products/hd-mirror.jpg"],
    ["Canvas Wall Art Set (3)", "Gallery wall set for feature walls.", "Ready to hang · fade-resistant print.", "Canvas", "Printed", "Set of 3", "—", "Living / bedroom", "set", 2200, 3500, "/products/hd-art.jpg"],
    ["Wall Clock Modern Dial", "Silent sweep wall clock.", "Large numerals · battery operated.", "ABS + glass", "Matte", "12 inch", "—", "Living", "piece", 900, 1500, "/products/hd-clock.jpg"],
    ["Metal Wall Shelf Pair", "Floating shelves for décor and books.", "Powder-coated brackets.", "MS + wood look", "Walnut / Black", "Pair", "—", "Living / study", "set", 1600, 2400, "/products/hd-shelf.jpg"],
    ["Artificial Plant in Planter", "Low-maintenance greenery for corners.", "UV-stable leaves · ceramic pot.", "Plastic + ceramic", "Green", "Medium", "—", "Living / balcony", "piece", 700, 1100, "/products/hd-plant.jpg"],
    ["Planter Pot Set (3)", "Nested planters for indoor greens.", "Drainage ready · modern shapes.", "Fibre clay", "Terracotta tone", "Set of 3", "—", "Gardening", "set", 1200, 1800, "/products/hd-plant.jpg"],
    ["Scented Candle Jar Duo", "Cosy evening fragrance pair.", "Soy blend · glass jars.", "Glass + wax", "Amber", "2 jars", "—", "Bedroom / living", "set", 600, 900, "/products/hd-candle.jpg"],
    ["Photo Frame Gallery (4)", "Mixed-size photo frame cluster.", "Table + wall use.", "MDF + glass", "Black", "Set of 4", "—", "Living / bedroom", "set", 1100, 1700, "/products/hd-frame.jpg"],
    ["Decorative Figurine Pair", "Shelf figurines for console styling.", "Resin cast · matte paint.", "Resin", "Ivory / Gold", "Pair", "—", "Living", "set", 1000, 1600, "/products/hd-sculpture.jpg"],
    ["Wall Décor Metal Art", "Laser-cut metal wall accent.", "Indoor · easy hang.", "MS powder coat", "Black", "Large", "2 mm", "Feature wall", "piece", 2100, 3200, "/products/hd-art.jpg"],
    ["Table Centrepiece Tray", "Display tray for coffee table.", "Mirror base · steel rim.", "SS + glass", "Chrome", "Medium", "—", "Living / dining", "piece", 1300, 1900, "/products/hd-vase.jpg"],
    ["Statement Floor Mirror", "Full-length leaner mirror.", "Safety film · stand.", "Glass + wood", "Oak / Black", "Large", "5 mm", "Bedroom", "piece", 5500, 7800, "/products/hd-mirror.jpg"],
    ["Cushion Cover Set (4)", "Soft throw covers for sofa styling.", "Zippered · washable covers.", "Cotton / linen blend", "Assorted", "16×16 in", "—", "Living", "set", 900, 1400, "/products/hd-pillow.jpg"],
    ["Table Lamp Ceramic Base", "Bedside / console table lamp.", "Fabric shade · warm light.", "Ceramic + fabric", "Ivory", "Medium", "—", "Bedroom", "piece", 1800, 2600, "/products/hd-lamp.jpg"],
    ["Outdoor Patio Lantern", "Decorative lantern for balconies.", "LED candle compatible.", "Metal + glass", "Black", "Tall", "—", "Balcony", "piece", 1500, 2300, "/products/hd-candle.jpg"],
    ["Artificial Flower Bouquet", "Ready bouquet for vase fills.", "No water · fade resistant.", "Fabric", "Multicolour", "Bouquet", "—", "Home", "piece", 500, 800, "/products/hd-plant.jpg"],
    ["Brass Spiritual Diya Set", "Festive and daily pooja diya set.", "Polish finish · reusable.", "Brass", "Antique gold", "Set of 4", "—", "Pooja", "set", 900, 1400, "/products/hd-sculpture.jpg"],
    ["Pooja Toran Festive", "Door toran for festivals.", "Handmade beads · reusable.", "Fabric / beads", "Red-gold", "Standard", "—", "Entrance", "piece", 400, 700, "/products/hd-frame.jpg"],
    ["Kids Room Wall Stickers", "Peel-and-stick décor pack.", "Removable · non-toxic ink.", "Vinyl", "Printed", "Pack", "—", "Kids room", "set", 300, 500, "/products/hd-art.jpg"],
    ["Curated Décor Gift Box", "Housewarming décor gift combo.", "Candle + frame + mini vase.", "Mixed", "Assorted", "Gift box", "—", "Gifting", "set", 1800, 2500, "/products/hd-candle.jpg"],
    ["Bookshelf Décor Object Set", "Styled objects for open shelves.", "Ceramic + resin mix.", "Mixed", "Neutral", "Set of 3", "—", "Living / study", "set", 1400, 2100, "/products/hd-shelf.jpg"],
    ["Wall Gallery Led Picture Light", "Picture light for art walls.", "Warm LED · easy mount.", "Metal + LED", "Brass / Black", "Unit", "—", "Feature wall", "piece", 2200, 3200, "/products/hd-lamp.jpg"],
  ],

  "building-interior-item": [
    ["MDF Fluted Wall Panel", "Fluted MDF for feature walls and receptions.", "Paint-ready · acoustic look · easy install.", "MDF", "Raw / primed", "8×2 ft", "12 mm", "Feature wall", "sheet", 2200, 3200, "/products/bii-laminate.jpg"],
    ["Interior Laminate Sheet", "HPL laminate for cabinetry and cladding.", "High abrasion · wood / solid colours.", "HPL", "Woodgrain", "8×4 ft", "1 mm", "Cabinets", "sheet", 1800, 2800, "/products/bii-laminate.jpg"],
    ["Interior Louver Panel Set", "Vertical louvers for cabins and receptions.", "Modular clips · laminate finish.", "MDF / WPC", "Walnut", "Set 4", "—", "Commercial", "set", 4500, 6500, "/products/bii-louver.jpg"],
    ["Office Partition Hardware Kit", "Hardware pack for glass office partitions.", "Floor spring compatible · SS finish.", "SS 304", "Brushed", "Kit", "—", "Office", "set", 3200, 4800, "/products/bii-handle.jpg"],
    ["Acoustic Wall Baffle", "Fabric acoustic baffle for meeting rooms.", "Noise control · modern look.", "Foam + fabric", "Grey", "Panel", "50 mm", "Office", "piece", 2800, 3900, "/products/bii-acoustic.jpg"],
    ["Interior Glass Film Frosted", "Frosted film for cabin privacy.", "DIY install · glare cut.", "PVC film", "Frost", "Roll 5 m", "—", "Cabin", "roll", 900, 1400, "/products/bi-glass.jpg"],
    ["False Ceiling Grid Channel", "GI channel for modular ceilings.", "Straight lengths · site ready.", "GI", "Galvanised", "12 ft", "0.5 mm", "Ceiling", "piece", 200, 400, "/products/bii-ceiling.jpg"],
    ["Skirting Profile PVC", "Flexible skirting for interiors.", "Impact resistant · paint match.", "PVC", "White", "8 ft", "—", "Floor edge", "piece", 300, 500, "/products/bii-skirting.jpg"],
    ["Door Closer Heavy Duty", "Commercial door closer.", "Adjustable speed · metal body.", "Steel", "Silver", "Unit", "—", "Doors", "piece", 1600, 2400, "/products/bii-handle.jpg"],
    ["Interior LED Profile Cove", "Aluminium cove profile for indirect lighting.", "Diffuser included · 2 m.", "Aluminium", "Anodised", "2 m", "—", "Ceiling / wall", "piece", 700, 1100, "/products/bii-led.jpg"],
    ["Reception Desk Laminate Top", "Counter laminate top blank for fit-outs.", "Scratch resistant · custom cut.", "HPL on board", "Stone look", "Custom", "18 mm", "Reception", "piece", 4800, 7200, "/products/bii-laminate.jpg"],
    ["Wall Panelling Clip System", "Concealed clips for wall panels.", "Fast install · pack of 50.", "MS / Alu", "Black", "Pack 50", "—", "Panelling", "set", 1200, 1800, "/products/bii-louver.jpg"],
    ["Interior ACP Sheet", "Interior-grade ACP for columns and bulkheads.", "Lightweight · clean joints.", "ACP", "Solid colour", "8×4 ft", "3 mm", "Retail / office", "sheet", 2100, 3100, "/products/be-acp.jpg"],
    ["Glass Railing Bracket Set", "Spigot brackets for indoor glass railings.", "SS 304 · floor mount · set of 4.", "SS 304", "Mirror", "Set 4", "—", "Staircase", "set", 3500, 5200, "/products/bii-handle.jpg"],
    ["Soft-Close Drawer Channel", "Full extension soft-close channels.", "Pair · 450 mm.", "Steel", "Zinc", "Pair", "—", "Furniture", "set", 600, 900, "/products/bii-handle.jpg"],
    ["Interior Vinyl Floor Plank", "Click-lock vinyl plank box.", "Water resistant · wood look.", "SPC / Vinyl", "Oak", "Box ~1.5 sqm", "4 mm", "Flooring", "box", 2400, 3600, "/products/bii-vinyl.jpg"],
    ["Column Cladding Kit", "Ready kit for square column wraps.", "Laminate + edge band.", "MDF + laminate", "Grey", "Kit", "—", "Lobby", "set", 3900, 5800, "/products/bii-laminate.jpg"],
    ["Meeting Room Whiteboard Panel", "Magnetic whiteboard wall panel.", "Write-erase · mount kit.", "Steel enamel", "White", "4×3 ft", "—", "Office", "piece", 4200, 6100, "/products/bii-acoustic.jpg"],
    ["Cable Management Raceway", "Wall raceway for fit-out cabling.", "Snap cover · paintable.", "PVC", "White", "2 m", "—", "Office", "piece", 200, 400, "/products/bii-skirting.jpg"],
    ["Interior Handle Bar Set", "Long bar handles for cabinetry.", "SS · screws included · set of 10.", "SS", "Brushed", "Set 10", "—", "Furniture", "set", 1100, 1700, "/products/bii-handle.jpg"],
    ["Acoustic Ceiling Baffle Set", "Hanging baffles for open offices.", "Fabric wrap · reduce echo.", "Foam + fabric", "Grey / Blue", "Set 6", "—", "Ceiling", "set", 5400, 7200, "/products/bii-ceiling.jpg"],
    ["Edge Banding Roll Woodgrain", "Matching edge band for laminate jobs.", "Hot-melt ready · 50 m.", "PVC / ABS", "Woodgrain", "50 m roll", "—", "Cabinetry", "roll", 500, 800, "/products/bii-laminate.jpg"],
    ["Floor Transition Profile", "Aluminium transition for floor level changes.", "Anodised · screw cover.", "Aluminium", "Silver", "2.5 m", "—", "Flooring", "piece", 400, 700, "/products/bii-skirting.jpg"],
    ["Interior Door Lockset Passage", "Passage / privacy lockset for cabins.", "SS finish · latch included.", "SS / Zinc", "Satin", "Set", "—", "Doors", "set", 900, 1400, "/products/bii-handle.jpg"],
  ],

  "building-exterior": [
    ["Exterior HPL Facade Sheet", "UV-stable HPL for large elevations.", "Moisture sealed · colour stable · low maintenance.", "Exterior HPL", "Solid / wood", "8×4 ft", "6 mm", "Facade", "sheet", 4800, 7200, "/products/be-facade.jpg"],
    ["NFC Exterior Cladding Board", "Waterproof natural fibre composite board.", "No swell · termite resistant · balcony & soffit.", "NFC", "Wood tone", "8×1 ft", "16 mm", "Cladding", "piece", 3200, 4800, "/products/be-cladding.jpg"],
    ["Stone Veneer Panel Opaque", "Natural stone look with reduced dead load.", "Weather resistant · elevation & boundary walls.", "Stone veneer", "Natural", "Panel", "—", "Elevation", "piece", 2800, 4200, "/products/be-stone.jpg"],
    ["Translucent Stone Veneer", "Backlit-capable thin stone veneer.", "Hospitality facades · light diffusion.", "Stone veneer", "Onyx look", "Panel", "—", "Feature elevation", "piece", 5500, 8200, "/products/be-stone.jpg"],
    ["Metal Louver Blade Set", "Sun-control metal louvers for elevations.", "Shading + ventilation · powder coat.", "Aluminium / MS", "Powder coat", "Set 6", "—", "Facade screen", "set", 4200, 6500, "/products/be-louver.jpg"],
    ["Exterior Decking Plank", "Slip-resistant outdoor decking plank.", "Terrace & poolside · moisture stable.", "WPC / Composite", "Teak look", "2.4 m", "—", "Terrace", "piece", 1200, 1900, "/products/be-deck.jpg"],
    ["Pergola Section Kit", "Exterior pergola framing sections.", "Pairs with decking & cladding.", "MS / Alu", "Matte black", "Kit", "—", "Outdoor", "set", 7800, 9900, "/products/be-pergola.jpg"],
    ["ACP Exterior Sheet PVDF", "PVDF coated ACP for commercial elevations.", "Colour fast · lightweight.", "ACP", "PVDF colour", "8×4 ft", "4 mm", "Facade", "sheet", 3600, 5400, "/products/be-acp.jpg"],
    ["Exterior Balcony Front Panel", "Ready panel for balcony front cladding.", "HPL / NFC option · cut sizes.", "HPL / NFC", "Graphite", "Custom", "—", "Balcony", "piece", 2600, 3900, "/products/be-balcony.jpg"],
    ["Sunshade Fin Module", "Vertical elevation fin module.", "Heat gain reduction.", "Aluminium", "Powder coat", "Module", "—", "High-rise", "piece", 3300, 4900, "/products/be-louver.jpg"],
    ["Exterior Flashing Profile", "Aluminium flashing for facade joints.", "Water shedding detail.", "Aluminium", "Mill / anodised", "3 m", "—", "Detailing", "piece", 500, 800, "/products/be-acp.jpg"],
    ["Facade Fixing Bracket Pack", "Hidden fixing brackets for cladding.", "Stainless fasteners included.", "SS / MS", "Zinc", "Pack 20", "—", "Install", "set", 1400, 2100, "/products/be-cladding.jpg"],
    ["Boundary Wall Cladding Pack", "Starter pack for compound wall upgrades.", "Veneer + adhesive guidance.", "Mixed", "Stone look", "Pack", "—", "Boundary", "set", 4500, 6800, "/products/be-stone.jpg"],
    ["Roof Edge Coping Cap", "Metal coping for parapet edges.", "Clean termination detail.", "GI / Alu", "Powder coat", "3 m", "—", "Parapet", "piece", 900, 1400, "/products/be-facade.jpg"],
    ["Storefront Cladding Kit", "Retail storefront elevation kit.", "ACP + trim + fixings.", "ACP kit", "Brand colour", "Kit", "—", "Retail", "set", 8500, 10000, "/products/be-acp.jpg"],
    ["Elevation Sample Board Set", "Physical sample board for facade selection.", "HPL + NFC + veneer chips.", "Mixed samples", "Assorted", "Board", "—", "Specification", "set", 1500, 2200, "/products/be-cladding.jpg"],
    ["PU Rock Accent Panel", "Lightweight rugged stone texture panel.", "Easy install · café & retail fronts.", "PU", "Rock texture", "Panel", "—", "Accent wall", "piece", 1800, 2700, "/products/be-stone.jpg"],
    ["Flexistone Exterior Cladding", "Flexible stone-look cladding for curves.", "Paintable · moisture stable.", "Flexistone", "Paintable", "Roll / panel", "—", "Feature facade", "sq ft", 900, 1500, "/products/be-cladding.jpg"],
    ["Exterior Alabaster Sheet", "UV-treated sheet for illuminated portals.", "Night identity · outdoor stable.", "Alabaster sheet", "Warm white", "Sheet", "—", "Entrance / signage", "sheet", 6100, 9000, "/products/be-facade.jpg"],
    ["Glass Balcony Railing Exterior", "Exterior balcony glass railing system.", "SS posts · toughened / laminated glass.", "SS + glass", "Satin", "Running ft", "12 mm", "Balcony", "running ft", 2800, 3900, "/products/be-balcony.jpg"],
    ["Composite Window Surround Trim", "Exterior window surround trim kit.", "Weather seal · clean frame reveal.", "Composite / Alu", "White / Grey", "Kit", "—", "Fenestration", "set", 2200, 3200, "/products/be-facade.jpg"],
    ["Terrace Planter Cladding Kit", "Cladding kit for outdoor planter boxes.", "NFC / WPC · screw fix.", "NFC / WPC", "Wood tone", "Kit", "—", "Terrace", "set", 3400, 4800, "/products/be-deck.jpg"],
    ["Exterior Sealant Pack (12)", "Facade joint sealant cartridge pack.", "UV resistant · paintable skin.", "Silicone / PU", "Grey", "Pack 12", "—", "Joints", "set", 2400, 3200, "/products/be-acp.jpg"],
    ["High-Rise Spandrel Panel", "Spandrel / opaque panel for curtain wall zones.", "ACP / glass options · project supply.", "ACP / glass", "Solid", "Custom", "—", "Curtain wall", "sq ft", 1600, 2400, "/products/be-louver.jpg"],
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
    const featured = n < 6;

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
    console.log("Upserting categories…");
    for (const c of CATEGORIES) {
      const id = await upsertCategory(c);
      console.log(`  ${c[1]} → ${id}`);
    }

    console.log("\nReplacing products with real catalogue…");
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
    console.log(`\nDone. ${total} real products across all categories.`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
