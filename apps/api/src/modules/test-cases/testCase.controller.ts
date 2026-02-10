import { Response } from "express";
import { AuthenticatedRequest } from "../../types/auth-request";
import {
  createTestCaseSchema,
  listTestCasesQuerySchema,
} from "./testCase.schema";
import {
  createTestCase,
  listTestCases,
} from "./testCase.service";

/* ============================
   CREATE TEST CASE (FR-TC-001)
   ============================ */

export async function createTestCaseController(
  req: AuthenticatedRequest,
  res: Response
) {
  const userId = req.user.id;

  const parsed = createTestCaseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.flatten(),
    });
  }

  const testCase = await createTestCase(parsed.data, userId);

  return res.status(201).json({
    message: "Test case created successfully",
    data: testCase,
  });
}

/* ============================
   LIST TEST CASES (FR-TC-002)
   ============================ */

export async function listTestCasesController(
  req: AuthenticatedRequest,
  res: Response
) {
  const parsed = listTestCasesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid query parameters",
      errors: parsed.error.flatten(),
    });
  }

  const { page, limit, status, priority, module } = parsed.data;

  const result = await listTestCases({
    page,
    limit,
    status,
    priority,
    module,
    userId: req.user.id,
    role: req.user.role,
  });

  return res.status(200).json({
    meta: {
      page,
      limit,
      total: result.total,
    },
    data: result.items,
  });
}
