const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  console.warn("EXPO_PUBLIC_API_URL is not configured");
}

export async function apiRequest(path, options = {}) {
  const method = options.method || "GET";

  console.log(`[API] ${method} ${API_BASE_URL}${path}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  console.log(`[API] Response ${response.status}`, {
    success: data.success,
    role: data.role,
    error: data.error,
  });

  if (!response.ok) {
    const error = new Error(data.error || "Unable to complete the request");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
