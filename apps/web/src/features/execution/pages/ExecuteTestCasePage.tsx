import { ExecutionStepCard } from "../components/ExecutionStepCard"

export const ExecuteTestCasePage = () => {
  // Temporary mock data (Day 1 only)
  const steps = [
    {
      id: "1",
      action: "Navigate to login page",
      expectedResult: "Login page loads successfully",
    },
    {
      id: "2",
      action: "Enter valid credentials",
      expectedResult: "Credentials accepted without errors",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Test Execution</h1>

      <section className="space-y-4">
        {steps.map((step, index) => (
          <ExecutionStepCard
            key={step.id}
            stepNumber={index + 1}
            action={step.action}
            expectedResult={step.expectedResult}
          />
        ))}
      </section>

      <button className="border px-4 py-2 rounded">
        Complete Execution
      </button>
    </div>
  )
}
