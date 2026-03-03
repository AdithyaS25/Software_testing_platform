import { Response, RequestHandler } from "express";
import { prisma } from "../../prisma";
import {
  executeSuite,
  completeSuiteExecution,
  getSuiteExecutionReport
} from "./testSuite.service";
import { AuthenticatedRequest } from "../../types/auth-request";

/* ============================
   CREATE TEST SUITE
============================ */

export const createTestSuiteController: RequestHandler = async (
  req,
  res: Response
) => {
  const authReq = req as AuthenticatedRequest;

  const projectIdParam = req.params.projectId;
  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  const { name, description, module, parentId } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Suite name is required" });
  }

  if (!authReq.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (parentId) {
    const parentSuite = await prisma.testSuite.findFirst({
      where: { id: String(parentId), projectId },
    });

    if (!parentSuite) {
      return res.status(400).json({
        message: "Parent suite not found in this project",
      });
    }
  }

  const suite = await prisma.testSuite.create({
    data: {
      name,
      description: description ?? null,
      module: module ?? null,
      createdById: authReq.user.id,
      projectId,
      parentId: parentId ? String(parentId) : null,
    },
  });

  return res.status(201).json(suite);
};

/* ============================
   GET SUITES (Project Scoped)
============================ */

export const getTestSuitesController: RequestHandler = async (
  req,
  res: Response
) => {
  const projectIdParam = req.params.projectId;
  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  const suites = await prisma.testSuite.findMany({
    where: {
      projectId,
      parentId: null,
      isArchived: false,
    },
    include: {
      testCases: {
        include: { testCase: true },
        orderBy: { position: "asc" },
      },
      children: {
        where: { projectId },
        include: {
          testCases: {
            include: { testCase: true },
            orderBy: { position: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json(suites);
};

/* ============================
   EXECUTE SUITE (Project Safe)
============================ */

export const executeSuiteController: RequestHandler = async (
  req,
  res
) => {
  const authReq = req as AuthenticatedRequest;

  const projectIdParam = req.params.projectId;
  const suiteIdParam = req.params.suiteId;

  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  const suiteId = Array.isArray(suiteIdParam)
    ? suiteIdParam[0]
    : suiteIdParam;

  if (!projectId || !suiteId || !authReq.user) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const { executionMode } = req.body;

  const result = await executeSuite(
    projectId,
    suiteId,
    authReq.user.id,
    executionMode
  );

  return res.status(201).json({
    message: "Suite execution started",
    data: result,
  });
};

export const completeSuiteExecutionController: RequestHandler =
  async (req, res) => {
    const idParam = req.params.suiteExecutionId;
    const suiteExecutionId = Array.isArray(idParam)
      ? idParam[0]
      : idParam;

    if (!suiteExecutionId) {
      return res.status(400).json({ message: "Invalid execution ID" });
    }

    const result = await completeSuiteExecution(suiteExecutionId);

    return res.status(200).json({
      message: "Suite execution completed",
      data: result,
    });
  };

export const getSuiteExecutionReportController: RequestHandler =
  async (req, res) => {
    const idParam = req.params.suiteExecutionId;
    const suiteExecutionId = Array.isArray(idParam)
      ? idParam[0]
      : idParam;

    if (!suiteExecutionId) {
      return res.status(400).json({ message: "Invalid execution ID" });
    }

    const report = await getSuiteExecutionReport(suiteExecutionId);

    return res.status(200).json(report);
  };

 export const reorderSuiteTestCasesController: RequestHandler = async (
  req,
  res
) => {
  const projectIdParam = req.params.projectId;
  const idParam = req.params.id;

  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  const suiteId = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!projectId || !suiteId) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  const { orderedTestCaseIds } = req.body;

  if (!Array.isArray(orderedTestCaseIds) || orderedTestCaseIds.length === 0) {
    return res.status(400).json({
      message: "orderedTestCaseIds must be a non-empty array",
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const suite = await tx.testSuite.findFirst({
        where: { id: suiteId, projectId },
      });

      if (!suite) {
        throw new Error("Suite not found in this project");
      }

      const existingRelations = await tx.testSuiteTestCase.findMany({
        where: { suiteId },
      });

      const existingIds = existingRelations.map((r) => r.testCaseId);

      for (const id of orderedTestCaseIds) {
        if (!existingIds.includes(id)) {
          throw new Error(`Test case ${id} does not belong to this suite`);
        }
      }

      for (let i = 0; i < orderedTestCaseIds.length; i++) {
        await tx.testSuiteTestCase.update({
          where: {
            suiteId_testCaseId: {
              suiteId,
              testCaseId: orderedTestCaseIds[i],
            },
          },
          data: { position: i + 1 },
        });
      }
    });

    return res.status(200).json({
      message: "Suite reordered successfully",
    });
  } catch (error: unknown) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
};


export const cloneSuiteController: RequestHandler = async (
  req,
  res
) => {
  const projectIdParam = req.params.projectId;
  const idParam = req.params.id;

  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  const suiteId = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!projectId || !suiteId) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  const original = await prisma.testSuite.findFirst({
    where: { id: suiteId, projectId },
    include: { testCases: true },
  });

  if (!original) {
    return res.status(404).json({ message: "Suite not found" });
  }

  const cloned = await prisma.$transaction(async (tx) => {
    const newSuite = await tx.testSuite.create({
      data: {
        name: `${original.name} (Clone)`,
        description: original.description,
        module: original.module,
        createdById: original.createdById,
        projectId,
      },
    });

    await Promise.all(
      original.testCases.map((tc) =>
        tx.testSuiteTestCase.create({
          data: {
            suiteId: newSuite.id,
            testCaseId: tc.testCaseId,
            position: tc.position,
          },
        })
      )
    );

    return newSuite;
  });

  return res.status(201).json({
    message: "Suite cloned successfully",
    data: cloned,
  });
};

export const archiveSuiteController: RequestHandler = async (
  req,
  res
) => {
  const projectIdParam = req.params.projectId;
  const idParam = req.params.id;

  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  const suiteId = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!projectId || !suiteId) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  const suite = await prisma.testSuite.updateMany({
    where: { id: suiteId, projectId },
    data: {
      isArchived: true,
      archivedAt: new Date(),
    },
  });

  return res.status(200).json(suite);
};

export const restoreSuiteController: RequestHandler = async (
  req,
  res
) => {
  const projectIdParam = req.params.projectId;
  const idParam = req.params.id;

  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  const suiteId = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!projectId || !suiteId) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  const suite = await prisma.testSuite.updateMany({
    where: { id: suiteId, projectId },
    data: {
      isArchived: false,
      archivedAt: null,
    },
  });

  return res.status(200).json(suite);
};

export const addTestCaseToSuiteController: RequestHandler = async (
  req,
  res
) => {
  const projectIdParam = req.params.projectId;
  const suiteIdParam = req.params.id;

  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  const suiteId = Array.isArray(suiteIdParam)
    ? suiteIdParam[0]
    : suiteIdParam;

  const { testCaseId } = req.body;

  if (!projectId || !suiteId || !testCaseId) {
    return res.status(400).json({
      message: "Project ID, Suite ID and Test Case ID required",
    });
  }

  const suite = await prisma.testSuite.findFirst({
    where: { id: suiteId, projectId },
  });

  if (!suite) {
    return res.status(404).json({ message: "Suite not found" });
  }

  const maxPosition = await prisma.testSuiteTestCase.aggregate({
    where: { suiteId },
    _max: { position: true },
  });

  const newPosition = (maxPosition._max.position ?? 0) + 1;

  const relation = await prisma.testSuiteTestCase.create({
    data: {
      suiteId,
      testCaseId,
      position: newPosition,
    },
  });

  return res.status(200).json(relation);
};

export const removeTestCaseFromSuiteController: RequestHandler = async (
  req,
  res
) => {
  const projectIdParam = req.params.projectId;
  const suiteIdParam = req.params.id;

  const projectId = Array.isArray(projectIdParam)
    ? projectIdParam[0]
    : projectIdParam;

  const suiteId = Array.isArray(suiteIdParam)
    ? suiteIdParam[0]
    : suiteIdParam;

  const { testCaseId } = req.body;

  if (!projectId || !suiteId || !testCaseId) {
    return res.status(400).json({
      message: "Invalid parameters",
    });
  }

  await prisma.testSuiteTestCase.delete({
    where: {
      suiteId_testCaseId: {
        suiteId,
        testCaseId,
      },
    },
  });

  return res.status(200).json({
    message: "Test case removed from suite",
  });
};