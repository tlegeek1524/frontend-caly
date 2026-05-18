const cache = new Map();

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("access_token");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  
  // Prepends base URL if url is a relative path
  const fullUrl = url.startsWith("http") ? url : `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;

  // Simple caching logic
  const cacheKey = `${fullUrl}-${JSON.stringify(options)}`;
  if (options.useCache && cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    // Return a mock response object that behaves like a real one
    return {
      ok: true,
      status: 200,
      json: async () => JSON.parse(JSON.stringify(cachedData)), // Return a copy
      clone: () => ({ json: async () => JSON.parse(JSON.stringify(cachedData)) })
    };
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }

  // Store in cache if requested and response is OK
  if (options.useCache && response.ok) {
    const clonedResponse = response.clone();
    const data = await clonedResponse.json();
    cache.set(cacheKey, data);
  }

  return response;
};

// Function to clear cache if needed (e.g., after an update)
export const clearApiCache = () => {
  cache.clear();
};
