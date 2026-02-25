import { apiClient } from "../../../shared/lib/axios";

export const createExecution = async (
  testCaseId: string,
  testRunId: string
) => {
  const res = await apiClient.post("/executions", {
    testCaseId,
    testRunId,
  });

  return res.data.data;
};

export const updateExecution = async (
  executionId: string,
  steps: any[]
) => {
  const res = await apiClient.patch(`/executions/${executionId}`, {
    steps,
  });

  return res.data;
};

export const completeExecution = async (executionId: string) => {
  const res = await apiClient.post(
    `/executions/${executionId}/complete`
  );

  return res.data;
};