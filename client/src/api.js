const API_BASE = import.meta.env.VITE_API_URL || "";

let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  getCompany: () => request("/api/company"),
  getStats: () => request("/api/stats"),
  getCategories: () => request("/api/categories"),
  getCategory: (slug) => request(`/api/categories/${slug}`),
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
      )
    ).toString();
    return request(`/api/products${qs ? `?${qs}` : ""}`);
  },
  getProduct: (id) => request(`/api/products/${id}`),
  submitInquiry: (body) =>
    request("/api/inquiries", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  createOrder: (body) =>
    request("/api/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  register: (body) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  me: () => request("/api/auth/me"),
};
