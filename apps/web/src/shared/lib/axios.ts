// src/shared/lib/axios.ts
import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

// Create axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // IMPORTANT for refresh cookie
});

// ===== Request Interceptor =====
// Attach access token automatically
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Attaching token:", token);

    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Response Interceptor =====
// Handle 401 -> attempt refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // If 401 and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;

        // Store new token
        sessionStorage.setItem("accessToken", newAccessToken);

        // Update header
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails → logout
        sessionStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
