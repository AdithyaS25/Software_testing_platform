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
  where: {
    parentId: null,
    isArchived: false,
  },
  include: {
    testCases: {
      include: {
        testCase: true,
      },
      orderBy: {
        position: "asc",
      },
    },
    children: {
      include: {
        testCases: {
          include: {
            testCase: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    },
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


/* ======================================================
   REMOVE TEST CASE
====================================================== */

export const removeTestCaseFromSuiteController: RequestHandler = async (
  req,
  res
) => {
  const suiteId = String(req.params.id);
  const { testCaseId } = req.body;

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

  export const reorderSuiteTestCasesController: RequestHandler = async (
  req,
  res
) => {
  const suiteId = String(req.params.id);
  const { orderedTestCaseIds } = req.body;

  if (!Array.isArray(orderedTestCaseIds) || orderedTestCaseIds.length === 0) {
    return res.status(400).json({
      message: "orderedTestCaseIds must be a non-empty array",
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Validate suite exists
      const suite = await tx.testSuite.findUnique({
        where: { id: suiteId },
      });

      if (!suite) {
        throw new Error("Suite not found");
      }

      // 2️⃣ Validate test cases belong to suite
      const existingRelations = await tx.testSuiteTestCase.findMany({
        where: { suiteId },
      });

      const existingIds = existingRelations.map((r) => r.testCaseId);

      for (const id of orderedTestCaseIds) {
        if (!existingIds.includes(id)) {
          throw new Error(
            `Test case ${id} does not belong to this suite`
          );
        }
      }

      // 3️⃣ Update positions sequentially (safe)
      for (let i = 0; i < orderedTestCaseIds.length; i++) {
        await tx.testSuiteTestCase.update({
          where: {
            suiteId_testCaseId: {
              suiteId,
              testCaseId: orderedTestCaseIds[i],
            },
          },
          data: {
            position: i + 1,
          },
        });
      }
    });

    return res.status(200).json({
      message: "Suite reordered successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const cloneSuiteController: RequestHandler = async (
  req,
  res
) => {
  const suiteId = String(req.params.id);

  const original = await prisma.testSuite.findUnique({
    where: { id: suiteId },
    include: {
      testCases: true,
    },
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
  const suiteId = String(req.params.id);

  const suite = await prisma.testSuite.update({
    where: { id: suiteId },
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
  const suiteId = String(req.params.id);

  const suite = await prisma.testSuite.update({
    where: { id: suiteId },
    data: {
      isArchived: false,
      archivedAt: null,
    },
  });

  return res.status(200).json(suite);
};