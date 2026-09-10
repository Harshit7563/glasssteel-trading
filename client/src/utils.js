export function inr(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function discountPercent(price, mrp) {
  const p = Number(price);
  const m = Number(mrp);
  if (!m || m <= p) return 0;
  return Math.round(((m - p) / m) * 100);
}

export function whatsappLink(phone, text) {
  const digits = String(phone || "919876543210").replace(/\D/g, "");
  const num = digits.startsWith("91") ? digits : `91${digits.slice(-10)}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
