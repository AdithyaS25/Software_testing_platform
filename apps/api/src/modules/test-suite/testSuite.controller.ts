// File: apps/api/src/modules/test-suite/testSuite.controller.ts
import { Response, RequestHandler } from "express";
import { prisma } from "../../prisma";
import { executeSuite, completeSuiteExecution, getSuiteExecutionReport } from "./testSuite.service";
import { AuthenticatedRequest } from "../../types/auth-request";

/* ── Create Test Suite ───────────────────────────────────── */
export const createTestSuiteController: RequestHandler = async (req, res: Response) => {
  const authReq   = req as AuthenticatedRequest;
  const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
  if (!projectId)    return res.status(400).json({ message: "Project ID is required" });
  if (!authReq.user) return res.status(401).json({ message: "Unauthorized" });

  const { name, description, module, parentId } = req.body;
  if (!name) return res.status(400).json({ message: "Suite name is required" });

  if (parentId) {
    const parentSuite = await prisma.testSuite.findFirst({ where: { id: String(parentId), projectId } });
    if (!parentSuite) return res.status(400).json({ message: "Parent suite not found in this project" });
  }

  const suite = await prisma.testSuite.create({
    data: {
      name, description: description ?? null, module: module ?? null,
      createdById: authReq.user.id, projectId,
      parentId: parentId ? String(parentId) : null,
    },
  });
  return res.status(201).json(suite);
};

/* ── Get Suites ──────────────────────────────────────────── */
export const getTestSuitesController: RequestHandler = async (req, res: Response) => {
  const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
  if (!projectId) return res.status(400).json({ message: "Project ID is required" });

  const suites = await prisma.testSuite.findMany({
    where: { projectId, parentId: null, isArchived: false },
    include: {
      testCases: { include: { testCase: true }, orderBy: { position: "asc" } },
      children: {
        where: { projectId },
        include: { testCases: { include: { testCase: true }, orderBy: { position: "asc" } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.status(200).json(suites);
};

/* ── Execute Suite ───────────────────────────────────────── */
export const executeSuiteController: RequestHandler = async (req, res) => {
  const authReq   = req as AuthenticatedRequest;
  const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
  const suiteId   = Array.isArray(req.params.suiteId)   ? req.params.suiteId[0]   : req.params.suiteId;
  if (!projectId || !suiteId || !authReq.user) return res.status(400).json({ message: "Invalid request" });

  const { executionMode } = req.body;
  const result = await executeSuite(projectId, suiteId, authReq.user.id, executionMode);
  return res.status(201).json({ message: "Suite execution started", data: result });
};

/* ── Complete Suite Execution ────────────────────────────── */
export const completeSuiteExecutionController: RequestHandler = async (req, res) => {
  const suiteExecutionId = Array.isArray(req.params.suiteExecutionId) ? req.params.suiteExecutionId[0] : req.params.suiteExecutionId;
  if (!suiteExecutionId) return res.status(400).json({ message: "Invalid execution ID" });
  const result = await completeSuiteExecution(suiteExecutionId);
  return res.status(200).json({ message: "Suite execution completed", data: result });
};

/* ── Get Suite Execution Report ──────────────────────────── */
export const getSuiteExecutionReportController: RequestHandler = async (req, res) => {
  const suiteExecutionId = Array.isArray(req.params.suiteExecutionId) ? req.params.suiteExecutionId[0] : req.params.suiteExecutionId;
  if (!suiteExecutionId) return res.status(400).json({ message: "Invalid execution ID" });
  const report = await getSuiteExecutionReport(suiteExecutionId);
  return res.status(200).json(report);
};

/* ── Reorder Suite Test Cases ────────────────────────────── */
export const reorderSuiteTestCasesController: RequestHandler = async (req, res) => {
  const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
  const suiteId   = Array.isArray(req.params.id)        ? req.params.id[0]        : req.params.id;
  if (!projectId || !suiteId) return res.status(400).json({ message: "Invalid parameters" });

  const { orderedTestCaseIds } = req.body;
  if (!Array.isArray(orderedTestCaseIds) || orderedTestCaseIds.length === 0) {
    return res.status(400).json({ message: "orderedTestCaseIds must be a non-empty array" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const suite = await tx.testSuite.findFirst({ where: { id: suiteId, projectId } });
      if (!suite) throw new Error("Suite not found in this project");

      const existingRelations = await tx.testSuiteTestCase.findMany({ where: { suiteId } });
      const existingIds = existingRelations.map((r) => r.testCaseId);

      for (const id of orderedTestCaseIds) {
        if (!existingIds.includes(id)) throw new Error(`Test case ${id} does not belong to this suite`);
      }
      for (let i = 0; i < orderedTestCaseIds.length; i++) {
        await tx.testSuiteTestCase.update({
          where: { suiteId_testCaseId: { suiteId, testCaseId: orderedTestCaseIds[i] } },
          data: { position: i + 1 },
        });
      }
    });
    return res.status(200).json({ message: "Suite reordered successfully" });
  } catch (error: unknown) {
    return res.status(400).json({ message: error instanceof Error ? error.message : "Internal server error" });
  }
};

/* ── Clone Suite ─────────────────────────────────────────── */
export const cloneSuiteController: RequestHandler = async (req, res) => {
  const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
  const suiteId   = Array.isArray(req.params.id)        ? req.params.id[0]        : req.params.id;
  if (!projectId || !suiteId) return res.status(400).json({ message: "Invalid parameters" });

  const original = await prisma.testSuite.findFirst({ where: { id: suiteId, projectId }, include: { testCases: true } });
  if (!original) return res.status(404).json({ message: "Suite not found" });

  const cloned = await prisma.$transaction(async (tx) => {
    const newSuite = await tx.testSuite.create({
      data: { name: `${original.name} (Clone)`, description: original.description, module: original.module, createdById: original.createdById, projectId },
    });
    await Promise.all(original.testCases.map((tc) =>
      tx.testSuiteTestCase.create({ data: { suiteId: newSuite.id, testCaseId: tc.testCaseId, position: tc.position } })
    ));
    return newSuite;
  });
  return res.status(201).json({ message: "Suite cloned successfully", data: cloned });
};

/* ── Archive / Restore Suite ─────────────────────────────── */
export const archiveSuiteController: RequestHandler = async (req, res) => {
  const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
  const suiteId   = Array.isArray(req.params.id)        ? req.params.id[0]        : req.params.id;
  if (!projectId || !suiteId) return res.status(400).json({ message: "Invalid parameters" });
  const suite = await prisma.testSuite.updateMany({ where: { id: suiteId, projectId }, data: { isArchived: true, archivedAt: new Date() } });
  return res.status(200).json(suite);
};

export const restoreSuiteController: RequestHandler = async (req, res) => {
  const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
  const suiteId   = Array.isArray(req.params.id)        ? req.params.id[0]        : req.params.id;
  if (!projectId || !suiteId) return res.status(400).json({ message: "Invalid parameters" });
  const suite = await prisma.testSuite.updateMany({ where: { id: suiteId, projectId }, data: { isArchived: false, archivedAt: null } });
  return res.status(200).json(suite);
};

/* ── Add Test Case to Suite ──────────────────────────────── */
export const addTestCaseToSuiteController: RequestHandler = async (req, res) => {
  const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
  const suiteId   = Array.isArray(req.params.id)        ? req.params.id[0]        : req.params.id;
  const { testCaseId } = req.body;

  if (!projectId || !suiteId || !testCaseId) {
    return res.status(400).json({ message: "Project ID, Suite ID and Test Case ID required" });
  }

  const suite = await prisma.testSuite.findFirst({ where: { id: suiteId, projectId } });
  if (!suite) return res.status(404).json({ message: "Suite not found" });

  // ✅ Resolve EITHER display ID (TC-2026-00016) OR real UUID
  const testCase = await prisma.testCase.findFirst({
    where: {
      projectId,
      OR: [
        { id: testCaseId },
        { testCaseId: testCaseId },
      ],
    },
    select: { id: true },
  });

  if (!testCase) {
    return res.status(404).json({ message: `Test case "${testCaseId}" not found in this project` });
  }

  // Prevent duplicates
  const existing = await prisma.testSuiteTestCase.findUnique({
    where: { suiteId_testCaseId: { suiteId, testCaseId: testCase.id } },
  });
  if (existing) return res.status(409).json({ message: "Test case already in this suite" });

  const maxPosition = await prisma.testSuiteTestCase.aggregate({
    where: { suiteId },
    _max: { position: true },
  });

  const relation = await prisma.testSuiteTestCase.create({
    data: {
      suiteId,
      testCaseId: testCase.id,   // ✅ always the real UUID
      position: (maxPosition._max.position ?? 0) + 1,
    },
  });
  return res.status(200).json(relation);
};

/* ── Remove Test Case from Suite ─────────────────────────── */
export const removeTestCaseFromSuiteController: RequestHandler = async (req, res) => {
  const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
  const suiteId   = Array.isArray(req.params.id)        ? req.params.id[0]        : req.params.id;
  const { testCaseId } = req.body;

  if (!projectId || !suiteId || !testCaseId) return res.status(400).json({ message: "Invalid parameters" });

  await prisma.testSuiteTestCase.delete({
    where: { suiteId_testCaseId: { suiteId, testCaseId } },
  });
  return res.status(200).json({ message: "Test case removed from suite" });
};