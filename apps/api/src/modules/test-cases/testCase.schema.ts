import { z } from "zod";
import { TestCasePriority, TestCaseStatus } from "@prisma/client";

const urlOrEmpty = z.string().optional().transform(v => v === "" ? undefined : v).pipe(z.string().url().optional());

export const createTestCaseSchema = z.object({
  title:       z.string().min(1).max(200),
  projectId:   z.string().cuid().optional(),
  description: z.string().optional(),
  module:      z.string().min(1),
  priority: z.enum(["CRITICAL","HIGH","MEDIUM","LOW"]),
  severity: z.enum(["BLOCKER","CRITICAL","MAJOR","MINOR","TRIVIAL"]),
  type:     z.enum(["FUNCTIONAL","REGRESSION","SMOKE","INTEGRATION","UAT","PERFORMANCE","SECURITY","USABILITY"]),
  status:   z.enum(["DRAFT","READY_FOR_REVIEW","APPROVED","DEPRECATED","ARCHIVED"]),
  preConditions:           z.string().optional(),
  testDataRequirements:    z.string().optional(),
  environmentRequirements: z.string().optional(),
  postConditions:          z.string().optional(),
  cleanupSteps:            z.string().optional(),
  estimatedDuration:       z.number().int().positive().optional(),
  automationStatus: z.enum(["NOT_AUTOMATED","IN_PROGRESS","AUTOMATED","CANNOT_AUTOMATE"]),
  automationScriptLink: urlOrEmpty,
  tags:  z.array(z.string()).optional(),
  steps: z.array(z.object({
    stepNumber:     z.number().int().positive(),
    action:         z.string().min(1),
    testData:       z.string().optional(),
    expectedResult: z.string().min(1),
  })).min(1),
});
export type CreateTestCaseInput = z.infer<typeof createTestCaseSchema>;

export const listTestCasesQuerySchema = z.object({
  page:     z.coerce.number().int().positive().default(1),
  limit:    z.coerce.number().int().positive().max(50).default(10),
  status:   z.nativeEnum(TestCaseStatus).optional(),
  priority: z.nativeEnum(TestCasePriority).optional(),
  module:   z.string().min(1).optional(),
  search:   z.string().min(1).optional(),
});
export type ListTestCasesQuery = z.infer<typeof listTestCasesQuerySchema>;

export const updateTestCaseSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  module:      z.string().min(1).optional(),
  priority: z.enum(["CRITICAL","HIGH","MEDIUM","LOW"]).optional(),
  severity: z.enum(["BLOCKER","CRITICAL","MAJOR","MINOR","TRIVIAL"]).optional(),
  type:     z.enum(["FUNCTIONAL","REGRESSION","SMOKE","INTEGRATION","UAT","PERFORMANCE","SECURITY","USABILITY"]).optional(),
  status:   z.enum(["DRAFT","READY_FOR_REVIEW","APPROVED","DEPRECATED","ARCHIVED"]).optional(),
  preConditions:           z.string().optional(),
  testDataRequirements:    z.string().optional(),
  environmentRequirements: z.string().optional(),
  postConditions:          z.string().optional(),
  cleanupSteps:            z.string().optional(),
  estimatedDuration:    z.number().int().positive().optional(),
  automationStatus:     z.enum(["NOT_AUTOMATED","IN_PROGRESS","AUTOMATED","CANNOT_AUTOMATE"]).optional(),
  automationScriptLink: urlOrEmpty,
  tags:  z.array(z.string()).optional(),
  steps: z.array(z.object({
    stepNumber:     z.number().int().positive(),
    action:         z.string().min(1),
    testData:       z.string().optional(),
    expectedResult: z.string().min(1),
  })).optional(),
});
export type UpdateTestCaseInput = z.infer<typeof updateTestCaseSchema>;