export const policies = {
  "privacy-policy": {
    title: "Privacy Policy",
    updated: "9 September 2026",
    sections: [
      {
        heading: "Information we collect",
        body: "When you submit an enquiry or contact form on GLASSTEEL, we collect your name, email, phone number, company name (if provided), and message content. We may also collect basic technical data such as browser type and pages visited to keep the platform secure and fast.",
      },
      {
        heading: "How we use your information",
        body: "We use your details to respond to product enquiries, share quotations, process bulk/dealer requests, improve catalogue relevance, and send transactional updates related to your enquiry. We do not sell personal data to third parties.",
      },
      {
        heading: "Sharing & retention",
        body: "Data may be shared with logistics partners, payment/GST billing systems, or authorised dealers only as needed to fulfil your order or enquiry. Enquiry records are retained as required for business, tax, and dispute resolution under applicable Indian laws.",
      },
      {
        heading: "Your rights",
        body: "You may request access, correction, or deletion of your personal information by emailing sales@glassteel.in. We will respond within a reasonable period as per applicable law.",
      },
    ],
  },
  "terms-of-use": {
    title: "Terms of Use",
    updated: "9 September 2026",
    sections: [
      {
        heading: "Platform use",
        body: "GLASSTEEL TRADING (OPC) PRIVATE LIMITED operates this website as a B2B/B2C trading catalogue for building interiors, home interiors, and steel & antique glass. By using the site you agree to these terms and all linked policies.",
      },
      {
        heading: "Product information",
        body: "Prices, stock status, sizes, and finishes are indicative and may change without prior notice. Final commercial terms are confirmed only on written quotation / tax invoice. Images and swatches are illustrative.",
      },
      {
        heading: "Accountable use",
        body: "You agree not to misuse the platform, scrape catalogue data at abusive scale, submit false enquiries, or attempt unauthorised access to our systems.",
      },
      {
        heading: "Liability",
        body: "To the maximum extent permitted by law, GLASSTEEL is not liable for indirect or consequential losses arising from use of catalogue information. Product suitability for site conditions remains the buyer’s / specifier’s responsibility.",
      },
    ],
  },
  "shipping-policy": {
    title: "Shipping & Dispatch Policy",
    updated: "9 September 2026",
    sections: [
      {
        heading: "Dispatch coverage",
        body: "We arrange pan-India dispatch from trading stock or partner fabricators. Delivery timelines depend on destination, SKU type (ready stock vs made-to-order), and transporter availability.",
      },
      {
        heading: "Ready stock vs made-to-order",
        body: "Items marked In Stock are typically prepared for dispatch within 1–4 business days after order confirmation and advance (if applicable). Made-to-Order / Limited Stock items follow the lead time stated on the quotation.",
      },
      {
        heading: "Freight & packaging",
        body: "Freight may be billed extra or included as per quotation. Glass and steel goods are packed for transit; buyers must inspect packages at delivery and note damage on the LR/POD before accepting.",
      },
      {
        heading: "Delays",
        body: "Force majeure, transporter strikes, weather, or customs/check-post delays may extend delivery. We will communicate revised ETAs where possible.",
      },
    ],
  },
  "return-refund-policy": {
    title: "Return & Refund Policy",
    updated: "9 September 2026",
    sections: [
      {
        heading: "Eligibility",
        body: "Returns are accepted only for manufacturing defects, wrong item dispatch, or transit damage noted at delivery — subject to inspection. Custom-cut, made-to-order, and cut-to-size glass/steel generally cannot be returned unless defective.",
      },
      {
        heading: "Return window",
        body: "Raise a return request within 48 hours of delivery with photos, invoice number, and SKU. Approved returns must be unused, in original packaging where applicable.",
      },
      {
        heading: "Refunds & replacements",
        body: "Approved cases are settled by replacement or refund to the original payment method / bank transfer within 7–14 business days after goods reach our warehouse and pass QC.",
      },
      {
        heading: "Non-returnable",
        body: "Installed materials, buyer’s-remorse on correct custom sizes, and goods damaged after delivery acceptance are not eligible for return.",
      },
    ],
  },
  "cancellation-policy": {
    title: "Cancellation Policy",
    updated: "9 September 2026",
    sections: [
      {
        heading: "Before dispatch",
        body: "Orders can be cancelled before dispatch/production start. Any advance may be adjusted against future orders or refunded as per payment mode, after deducting bank/gateway charges if any.",
      },
      {
        heading: "After production start",
        body: "Made-to-order items once cut/fabricated cannot be cancelled. Ready-stock orders already handed to transporter cannot be cancelled; use the return process if eligible on delivery.",
      },
      {
        heading: "How to cancel",
        body: "Email sales@glassteel.in or WhatsApp the sales number with your enquiry/order reference. Cancellation is confirmed only in writing from GLASSTEEL.",
      },
    ],
  },
  "gst-pricing-policy": {
    title: "GST & Pricing Policy",
    updated: "9 September 2026",
    sections: [
      {
        heading: "Displayed prices",
        body: "Catalogue prices are shown in INR (₹100–₹10,000) and are inclusive of GST. The listed amount is what you pay. GST invoice still shows taxable value + GST breakup for compliance.",
      },
      {
        heading: "MRP & offers",
        body: "MRP and % OFF badges are platform offer indicators. Final billing follows the accepted quotation and GST invoice.",
      },
      {
        heading: "GST invoice",
        body: "We issue GST-compliant invoices. Please share correct GSTIN and billing address at order time. Incorrect GSTIN may delay credit notes / e-invoicing.",
      },
      {
        heading: "Bulk & dealer rates",
        body: "Volume MOQ and registered dealer rates are available on request and may differ from listed catalogue prices.",
      },
    ],
  },
  "warranty-policy": {
    title: "Warranty Policy",
    updated: "9 September 2026",
    sections: [
      {
        heading: "Coverage",
        body: "Manufacturing defects in material/workmanship are covered as per the warranty period stated on the quotation or product sheet (typically 3–12 months for hardware finishes; glass breakage from impact is excluded).",
      },
      {
        heading: "Exclusions",
        body: "Damage from improper installation, site abuse, chemical cleaning, welding near glass, or structural movement is not covered.",
      },
      {
        heading: "Claims",
        body: "Write to sales@glassteel.in with invoice, photos, and installation date. Approved warranty claims are fulfilled by repair/replacement of the defective portion at our discretion.",
      },
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    updated: "9 September 2026",
    sections: [
      {
        heading: "What we use",
        body: "We may use essential cookies and similar storage to keep sessions secure, remember language/preferences, and measure aggregate traffic so we can improve the platform.",
      },
      {
        heading: "Your choice",
        body: "You can block non-essential cookies in your browser settings. Essential cookies required for basic site function may still apply.",
      },
    ],
  },
};

export const policyLinks = Object.entries(policies).map(([slug, p]) => ({
  slug,
  title: p.title,
}));
