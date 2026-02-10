import { z } from "zod";

export const createTestCaseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),

  module: z.string().min(1),

  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  severity: z.enum(["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "TRIVIAL"]),
  type: z.enum([
    "FUNCTIONAL",
    "REGRESSION",
    "SMOKE",
    "INTEGRATION",
    "UAT",
    "PERFORMANCE",
    "SECURITY",
    "USABILITY",
  ]),
  status: z.enum([
    "DRAFT",
    "READY_FOR_REVIEW",
    "APPROVED",
    "DEPRECATED",
    "ARCHIVED",
  ]),

  preConditions: z.string().optional(),
  testDataRequirements: z.string().optional(),
  environmentRequirements: z.string().optional(),

  postConditions: z.string().optional(),
  cleanupSteps: z.string().optional(),

  estimatedDuration: z.number().int().positive().optional(),

  automationStatus: z.enum([
    "NOT_AUTOMATED",
    "IN_PROGRESS",
    "AUTOMATED",
    "CANNOT_AUTOMATE",
  ]),
  automationScriptLink: z.string().url().optional(),

  tags: z.array(z.string()).optional(),

  steps: z
    .array(
      z.object({
        stepNumber: z.number().int().positive(),
        action: z.string().min(1),
        testData: z.string().optional(),
        expectedResult: z.string().min(1),
      })
    )
    .min(1),
});

export type CreateTestCaseInput = z.infer<typeof createTestCaseSchema>;
