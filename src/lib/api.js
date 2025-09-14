const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
export const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

// Helper buat join path ke API
export function joinApi(path = "") {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

// Fetch helper
export async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(joinApi(path), {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined,
  });

  if (!res.ok) {
    let errText = await res.text();
    throw new Error(errText || "API error");
  }
  return res.json();
}

// Helper khusus fetch dengan token
export async function fetchWithAuth(path, token, options = {}) {
  return api(path, { ...options, token });
}
