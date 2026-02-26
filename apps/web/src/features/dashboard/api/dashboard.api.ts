import { apiClient } from "../../../lib/axios";
import type { DashboardResponse } from "../types/dashboard.types";

export const getDashboardData = async (): Promise<DashboardResponse> => {
  const res = await apiClient.get("/reports/dashboard");
  return res.data.data;
};
