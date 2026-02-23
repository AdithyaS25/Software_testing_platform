import { AuthenticatedRequest } from "../../types/auth-request";
import { Response } from "express";
import { prisma } from "../../prisma";

export const createTestSuiteController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { name, description, module, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Suite name is required" });
    }

    // Optional parent validation
    if (parentId) {
      const parentSuite = await prisma.testSuite.findUnique({
        where: { id: parentId },
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
        createdById: req.user!.id,
        parentId: parentId || null,
      },
    });

    return res.status(201).json(suite);
  } catch {
    return res.status(500).json({
      message: "Failed to create test suite",
    });
  }
};

export const getTestSuitesController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const suites = await prisma.testSuite.findMany({
      where: {
        parentId: null, // only root suites
      },
      include: {
        testCases: true,
        children: {
          include: {
            testCases: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(suites);
  } catch {
    return res.status(500).json({
      message: "Failed to fetch test suites",
    });
  }
};

export const addTestCaseToSuiteController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const suiteId = String(req.params.id);
    const { testCaseId } = req.body;

    const suite = await prisma.testSuite.update({
      where: { id: suiteId },
      data: {
        testCases: {
          connect: { id: testCaseId },
        },
      },
    });

    return res.status(200).json(suite);
  } catch {
    return res.status(500).json({
      message: "Failed to add test case to suite",
    });
  }
};

export const removeTestCaseFromSuiteController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const suiteId = String(req.params.id);
    const { testCaseId } = req.body;

    const suite = await prisma.testSuite.update({
      where: { id: suiteId },
      data: {
        testCases: {
          disconnect: { id: testCaseId },
        },
      },
    });

    return res.status(200).json(suite);
  } catch {
    return res.status(500).json({
      message: "Failed to remove test case from suite",
    });
  }
};