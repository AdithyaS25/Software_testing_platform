// src/lib/axios.ts

import axios from "axios";
import type {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// ==========================
// Base Configuration
// ==========================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for refresh cookie
});

// ==========================
// Request Interceptor
// ==========================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================
// Response Interceptor
// ==========================

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If 401 and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken =
          refreshResponse.data.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token returned");
        }

        // Store new token
        sessionStorage.setItem(
          "accessToken",
          newAccessToken
        );

        // Update original request header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed → clear session
        sessionStorage.removeItem("accessToken");

        // Avoid infinite redirect loop
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
