import { useEffect, useState, useRef } from "react";
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
  const { id, testRunId } = useParams();

  const [executionId, setExecutionId] = useState<string | null>(null);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ StrictMode guard
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!id || !testRunId) return;

    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initExecution = async () => {
      try {
        const execution = await createExecution(id, testRunId);

        setExecutionId(execution.id);
        setSteps(execution.steps ?? []);
      } catch (err) {
        console.error("Create execution failed:", err);
      } finally {
        setLoading(false);
      }
    };

    initExecution();
  }, [id, testRunId]);

  const handleStepUpdate = async (
    stepId: string,
    data: Partial<ExecutionStep>
  ) => {
    if (!executionId) return;

    const updatedSteps = steps.map((step) =>
      step.id === stepId ? { ...step, ...data } : step
    );

    setSteps(updatedSteps);

    await updateExecution(executionId, [
      {
        id: stepId,
        status: data.status,
        actualResult: data.actualResult,
        notes: data.notes,
      },
    ]);
  };

  const handleComplete = async () => {
    if (!executionId) return;

    const result = await completeExecution(executionId);

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