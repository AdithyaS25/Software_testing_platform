import { Response } from "express";
import { AuthenticatedRequest } from "../../types/auth-request";
import {
  createTestCaseSchema,
  listTestCasesQuerySchema,
} from "./testCase.schema";
import {
  createTestCase,
  listTestCases,
  getTestCaseById,
} from "./testCase.service";

/* ============================
   CREATE TEST CASE (FR-TC-001)
   ============================ */

export async function createTestCaseController(
  req: AuthenticatedRequest,
  res: Response
) {
  const parsed = createTestCaseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.flatten(),
    });
  }

  const testCase = await createTestCase(parsed.data, req.user.id);

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

  const { page, limit, status, priority, module, search } = parsed.data;

  const result = await listTestCases({
    page,
    limit,
    status,
    priority,
    module,
    search,
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

/* ============================
   VIEW TEST CASE (FR-TC-003)
   ============================ */

export async function getTestCaseByIdController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { id } = req.params;

  // ✅ Validate route param
  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      message: "Invalid test case id",
    });
  }

  const testCase = await getTestCaseById(
    id,
    req.user.id,
    req.user.role
  );

  if (!testCase) {
    return res.status(404).json({
      message: "Test case not found",
    });
  }

  return res.status(200).json({
    data: testCase,
  });
}

/* ============================
   UPDATE TEST CASE (FR-TC-002)
   ============================ */

import { updateTestCaseSchema } from "./testCase.schema";
import { updateTestCase } from "./testCase.service";

export async function updateTestCaseController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid test case id" });
  }

  const parsed = updateTestCaseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.flatten(),
    });
  }

  const updated = await updateTestCase(
    id,
    parsed.data,
    req.user.id,
    req.user.role
  );

  if (!updated) {
    return res.status(404).json({ message: "Test case not found" });
  }

  return res.status(200).json({
    message: "Test case updated successfully",
    data: updated,
  });
}
