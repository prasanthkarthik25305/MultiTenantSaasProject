const API_BASE = "http://localhost:5000/api";

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(API_BASE + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });

  if (!res.ok) {
    const err = await res.json();
    throw err;
  }

  return res.json();
};
