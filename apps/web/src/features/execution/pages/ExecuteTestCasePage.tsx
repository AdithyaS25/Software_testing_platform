import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ExecutionStepCard } from "../components/ExecutionStepCard";
import {
  createExecution,
  updateExecution,
  completeExecution,
} from "../api/execution.api";

interface ExecutionStep {
  id: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
  status?: string;
  actualResult?: string;
  notes?: string;
}

export const ExecuteTestCasePage = () => {
  const { id } = useParams();
  const token = localStorage.getItem("accessToken") || "";

  const [executionId, setExecutionId] = useState<string | null>(null);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initExecution = async () => {
      if (!id) return;

      try {
  const execution = await createExecution(id, token);
  setExecutionId(execution.id);
  setSteps(execution.steps);
} catch (err) {
  console.error("Create execution failed:", err);
} finally {
  setLoading(false);
}
    };

    initExecution();
  }, [id]);

  const handleStepUpdate = async (
    stepId: string,
    data: Partial<ExecutionStep>
  ) => {
    if (!executionId) return;

    const updatedSteps = steps.map((step) =>
      step.id === stepId ? { ...step, ...data } : step
    );

    setSteps(updatedSteps);

    await updateExecution(
      executionId,
      [
        {
          id: stepId,
          status: data.status,
          actualResult: data.actualResult,
          notes: data.notes,
        },
      ],
      token
    );
  };

  const handleComplete = async () => {
    if (!executionId) return;

    const result = await completeExecution(executionId, token);

    alert(`Execution Completed. Result: ${result.overallResult}`);
  };

  if (loading) return <div>Loading execution...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Test Execution</h1>

      <section className="space-y-4">
        {steps.map((step) => (
          <ExecutionStepCard
            key={step.id}
            stepNumber={step.stepNumber}
            action={step.action}
            expectedResult={step.expectedResult}
            onUpdate={(data) => handleStepUpdate(step.id, data)}
          />
        ))}
      </section>

      <button
        onClick={handleComplete}
        className="border px-4 py-2 rounded"
      >
        Complete Execution
      </button>
    </div>
  );
};
