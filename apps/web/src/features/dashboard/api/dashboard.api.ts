import { apiClient } from '../../../lib/axios';

export const getDashboardData = async (projectId: string) => {
  const res = await apiClient.get(
    `/api/projects/${projectId}/reports/dashboard`
  );
  return res.data.data || res.data;
};
