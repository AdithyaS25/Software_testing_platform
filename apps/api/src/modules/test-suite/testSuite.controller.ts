import { Response, RequestHandler } from "express";
import { prisma } from "../../prisma";
import { executeSuite, 
  completeSuiteExecution, 
  getSuiteExecutionReport } from "./testSuite.service";
import { AuthenticatedRequest } from "../../types/auth-request";

/* ======================================================
   CREATE TEST SUITE
====================================================== */

export const createTestSuiteController: RequestHandler = async (
  req,
  res: Response
) => {
  const authReq = req as AuthenticatedRequest;

  const { name, description, module, parentId } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Suite name is required" });
  }

  if (!authReq.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (parentId) {
    const parentSuite = await prisma.testSuite.findUnique({
      where: { id: String(parentId) },
    });

    if (!parentSuite) {
      return res.status(400).json({
        message: "Parent suite not found",
      });
    }
  }

  const suite = await prisma.testSuite.create({
    data: {
      name,
      description,
      module,
      createdById: authReq.user.id,
      parentId: parentId ? String(parentId) : null,
    },
  });

  return res.status(201).json(suite);
};

/* ======================================================
   GET SUITES
====================================================== */

export const getTestSuitesController: RequestHandler = async (
  _req,
  res: Response
) => {
  const suites = await prisma.testSuite.findMany({
    where: { parentId: null },
    include: {
      testCases: true,
      children: { include: { testCases: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json(suites);
};

/* ======================================================
   ADD TEST CASE
====================================================== */

export const addTestCaseToSuiteController: RequestHandler = async (
  req,
  res
) => {
  const suiteId = String(req.params.id);
  const { testCaseId } = req.body;

  if (!suiteId || !testCaseId) {
    return res.status(400).json({
      message: "Suite ID and Test Case ID required",
    });
  }

  const suite = await prisma.testSuite.update({
    where: { id: suiteId },
    data: {
      testCases: { connect: { id: String(testCaseId) } },
    },
  });

  return res.status(200).json(suite);
};

/* ======================================================
   REMOVE TEST CASE
====================================================== */

export const removeTestCaseFromSuiteController: RequestHandler = async (
  req,
  res
) => {
  const suiteId = String(req.params.id);
  const { testCaseId } = req.body;

  if (!suiteId || !testCaseId) {
    return res.status(400).json({
      message: "Suite ID and Test Case ID required",
    });
  }

  const suite = await prisma.testSuite.update({
    where: { id: suiteId },
    data: {
      testCases: { disconnect: { id: String(testCaseId) } },
    },
  });

  return res.status(200).json(suite);
};

/* ======================================================
   EXECUTE SUITE
====================================================== */

export const executeSuiteController: RequestHandler = async (
  req,
  res
) => {
  const authReq = req as AuthenticatedRequest;

  const suiteId = String(req.params.suiteId);
  const { executionMode } = req.body;

  if (!authReq.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await executeSuite(
    suiteId,
    authReq.user.id,
    executionMode
  );

  return res.status(201).json({
    message: "Suite execution started",
    data: result,
  });
};


export const completeSuiteExecutionController: RequestHandler = async (
  req,
  res
) => {
  const suiteExecutionId = String(req.params.suiteExecutionId);

  const result = await completeSuiteExecution(suiteExecutionId);

  return res.status(200).json({
    message: "Suite execution completed",
    data: result,
  });
};

export const getSuiteExecutionReportController: RequestHandler =
  async (req, res) => {
    const suiteExecutionId = String(req.params.suiteExecutionId);

    const report = await getSuiteExecutionReport(
      suiteExecutionId
    );

    return res.status(200).json(report);
  };