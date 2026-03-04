import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = sessionStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, { refreshToken });
          sessionStorage.setItem("accessToken", res.data.accessToken);
          original.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return apiClient(original);
        } catch {
          sessionStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
