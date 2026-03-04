import { Response } from "express";
import { AuthenticatedRequest } from "../../types/auth-request";
import {
  createTestCaseSchema,
  listTestCasesQuerySchema,
  updateTestCaseSchema
} from "./testCase.schema";
import {
  createTestCase,
  listTestCases,
  getTestCaseById,
  updateTestCase,
  cloneTestCase,
  deleteTestCase
} from "./testCase.service";
import { getAuthUser } from "../../utils/getAuthUser";

/* ============================
   CREATE TEST CASE
============================ */
export async function createTestCaseController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
  const parsed = createTestCaseSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parsed.error.flatten(),
      });
    }

    const projectIdParam = req.params.projectId;
    const projectId = Array.isArray(projectIdParam)
      ? projectIdParam[0]
      : projectIdParam;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const user = getAuthUser(req);

    const testCase = await createTestCase(projectId, parsed.data, user.id);

    return res.status(201).json({
    message: "Test case created successfully",
    data: testCase,
  });
  } catch (err: any) {
    console.error("❌ createTestCase error:", err);
    return res.status(500).json({ message: err?.message ?? "Failed to create test case" });
  }
}

/* ============================
   LIST TEST CASES
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

  const projectIdParam = req.params.projectId;
  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  const { page, limit, status, priority, module, search } = parsed.data;
  const user = getAuthUser(req);

  const params: any = {
    page,
    limit,
    userId: user.id,
    role: user.role,
  };

  if (status !== undefined) params.status = status;
  if (priority !== undefined) params.priority = priority;
  if (module !== undefined) params.module = module;
  if (search !== undefined) params.search = search;

  const result = await listTestCases(projectId, params);

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
   GET TEST CASE
============================ */

export async function getTestCaseByIdController(
  req: AuthenticatedRequest,
  res: Response
) {
  const idParam = req.params.id;
  const projectIdParam = req.params.projectId;

  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  if (!id || !projectId) {
    return res.status(400).json({
      message: "Invalid id or projectId",
    });
  }

  const user = getAuthUser(req);

  const testCase = await getTestCaseById(
    projectId,
    id,
    user.id,
    user.role
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
   UPDATE TEST CASE
============================ */

export async function updateTestCaseController(
  req: AuthenticatedRequest,
  res: Response
) {
  const idParam = req.params.id;
  const projectIdParam = req.params.projectId;

  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  if (!id || !projectId) {
    return res.status(400).json({
      message: "Invalid id or projectId",
    });
  }

  const parsed = updateTestCaseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: parsed.error.flatten(),
    });
  }

  const user = getAuthUser(req);

  const updated = await updateTestCase(
    projectId,
    id,
    parsed.data,
    user.id,
    user.role
  );

  if (!updated) {
    return res.status(404).json({
      message: "Test case not found",
    });
  }

  return res.status(200).json({
    message: "Test case updated successfully",
    data: updated,
  });
}

/* ============================
   CLONE TEST CASE
============================ */

export async function cloneTestCaseController(
  req: AuthenticatedRequest,
  res: Response
) {
  const idParam = req.params.id;
  const projectIdParam = req.params.projectId;

  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  if (!id || !projectId) {
    return res.status(400).json({
      message: "Invalid id or projectId",
    });
  }

  const user = getAuthUser(req);

  const cloned = await cloneTestCase(
    projectId,
    id,
    user.id,
    user.role
  );

  if (!cloned) {
    return res.status(404).json({
      message: "Test case not found",
    });
  }

  return res.status(201).json({
    message: "Test case cloned successfully",
    data: cloned,
  });
}

/* ============================
   DELETE TEST CASE
============================ */

export async function deleteTestCaseController(
  req: AuthenticatedRequest,
  res: Response
) {
  const idParam = req.params.id;
  const projectIdParam = req.params.projectId;

  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  if (!id || !projectId) {
    return res.status(400).json({
      message: "Invalid id or projectId",
    });
  }

  const user = getAuthUser(req);

  const deleted = await deleteTestCase(
    projectId,
    id,
    user.id,
    user.role
  );

  if (!deleted) {
    return res.status(404).json({
      message: "Test case not found",
    });
  }

  return res.status(200).json({
    message: "Test case archived successfully",
  });
}
