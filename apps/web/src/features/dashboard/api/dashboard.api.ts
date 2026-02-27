import { apiClient } from "../../../lib/axios";

export const getDashboardData = async () => {
  const res = await apiClient.get("/reports/dashboard");
  return res.data.data || res.data;
};
