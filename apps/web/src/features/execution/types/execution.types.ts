export type StepExecutionStatus = 
  | "Pass"
  | "Fail"
  | "Blocked"
  | "Skipped";

export interface ExecutionStep {
  stepId: string;
  action: string;
  expectedResult: string;
  actualResult?: string;
  status?: StepExecutionStatus;
  notes?: string;
}

export interface TestExecution {
  id: string;
  testCaseId: string;
  status: "In Progress" | "Completed";
  startedAt: string;
  completedAt?: string;
  steps: ExecutionStep[];
}
