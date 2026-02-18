const API_BASE = "http://localhost:4000"; // adjust if needed

export const createExecution = async (
  testCaseId: string,
  token: string
) => {
  const res = await fetch(`${API_BASE}/executions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ testCaseId }),
  });

  if (!res.ok) {
    throw new Error("Failed to create execution");
  }

  return res.json();
};

export const updateExecution = async (
  executionId: string,
  steps: any[],
  token: string
) => {
  const res = await fetch(`${API_BASE}/executions/${executionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ steps }),
  });

  if (!res.ok) {
    throw new Error("Failed to update execution");
  }

  return res.json();
};

export const completeExecution = async (
  executionId: string,
  token: string
) => {
  const res = await fetch(
    `${API_BASE}/executions/${executionId}/complete`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to complete execution");
  }

  return res.json();
};
