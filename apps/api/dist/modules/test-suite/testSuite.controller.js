"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTestCaseFromSuiteController = exports.addTestCaseToSuiteController = exports.restoreSuiteController = exports.archiveSuiteController = exports.cloneSuiteController = exports.reorderSuiteTestCasesController = exports.getSuiteExecutionReportController = exports.completeSuiteExecutionController = exports.executeSuiteController = exports.getTestSuitesController = exports.createTestSuiteController = void 0;
const prisma_1 = require("../../prisma");
const testSuite_service_1 = require("./testSuite.service");
/* ============================
   CREATE TEST SUITE
============================ */
const createTestSuiteController = async (req, res) => {
    const authReq = req;
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
        const parentSuite = await prisma_1.prisma.testSuite.findFirst({
            where: { id: String(parentId), projectId },
        });
        if (!parentSuite) {
            return res.status(400).json({
                message: "Parent suite not found in this project",
            });
        }
    }
    const suite = await prisma_1.prisma.testSuite.create({
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
exports.createTestSuiteController = createTestSuiteController;
/* ============================
   GET SUITES (Project Scoped)
============================ */
const getTestSuitesController = async (req, res) => {
    const projectIdParam = req.params.projectId;
    const projectId = Array.isArray(projectIdParam)
        ? projectIdParam[0]
        : projectIdParam;
    if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
    }
    const suites = await prisma_1.prisma.testSuite.findMany({
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
exports.getTestSuitesController = getTestSuitesController;
/* ============================
   EXECUTE SUITE (Project Safe)
============================ */
const executeSuiteController = async (req, res) => {
    const authReq = req;
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
    const result = await (0, testSuite_service_1.executeSuite)(projectId, suiteId, authReq.user.id, executionMode);
    return res.status(201).json({
        message: "Suite execution started",
        data: result,
    });
};
exports.executeSuiteController = executeSuiteController;
const completeSuiteExecutionController = async (req, res) => {
    const idParam = req.params.suiteExecutionId;
    const suiteExecutionId = Array.isArray(idParam)
        ? idParam[0]
        : idParam;
    if (!suiteExecutionId) {
        return res.status(400).json({ message: "Invalid execution ID" });
    }
    const result = await (0, testSuite_service_1.completeSuiteExecution)(suiteExecutionId);
    return res.status(200).json({
        message: "Suite execution completed",
        data: result,
    });
};
exports.completeSuiteExecutionController = completeSuiteExecutionController;
const getSuiteExecutionReportController = async (req, res) => {
    const idParam = req.params.suiteExecutionId;
    const suiteExecutionId = Array.isArray(idParam)
        ? idParam[0]
        : idParam;
    if (!suiteExecutionId) {
        return res.status(400).json({ message: "Invalid execution ID" });
    }
    const report = await (0, testSuite_service_1.getSuiteExecutionReport)(suiteExecutionId);
    return res.status(200).json(report);
};
exports.getSuiteExecutionReportController = getSuiteExecutionReportController;
const reorderSuiteTestCasesController = async (req, res) => {
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
        await prisma_1.prisma.$transaction(async (tx) => {
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
    }
    catch (error) {
        return res.status(400).json({
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
};
exports.reorderSuiteTestCasesController = reorderSuiteTestCasesController;
const cloneSuiteController = async (req, res) => {
    const projectIdParam = req.params.projectId;
    const idParam = req.params.id;
    const projectId = Array.isArray(projectIdParam)
        ? projectIdParam[0]
        : projectIdParam;
    const suiteId = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!projectId || !suiteId) {
        return res.status(400).json({ message: "Invalid parameters" });
    }
    const original = await prisma_1.prisma.testSuite.findFirst({
        where: { id: suiteId, projectId },
        include: { testCases: true },
    });
    if (!original) {
        return res.status(404).json({ message: "Suite not found" });
    }
    const cloned = await prisma_1.prisma.$transaction(async (tx) => {
        const newSuite = await tx.testSuite.create({
            data: {
                name: `${original.name} (Clone)`,
                description: original.description,
                module: original.module,
                createdById: original.createdById,
                projectId,
            },
        });
        await Promise.all(original.testCases.map((tc) => tx.testSuiteTestCase.create({
            data: {
                suiteId: newSuite.id,
                testCaseId: tc.testCaseId,
                position: tc.position,
            },
        })));
        return newSuite;
    });
    return res.status(201).json({
        message: "Suite cloned successfully",
        data: cloned,
    });
};
exports.cloneSuiteController = cloneSuiteController;
const archiveSuiteController = async (req, res) => {
    const projectIdParam = req.params.projectId;
    const idParam = req.params.id;
    const projectId = Array.isArray(projectIdParam)
        ? projectIdParam[0]
        : projectIdParam;
    const suiteId = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!projectId || !suiteId) {
        return res.status(400).json({ message: "Invalid parameters" });
    }
    const suite = await prisma_1.prisma.testSuite.updateMany({
        where: { id: suiteId, projectId },
        data: {
            isArchived: true,
            archivedAt: new Date(),
        },
    });
    return res.status(200).json(suite);
};
exports.archiveSuiteController = archiveSuiteController;
const restoreSuiteController = async (req, res) => {
    const projectIdParam = req.params.projectId;
    const idParam = req.params.id;
    const projectId = Array.isArray(projectIdParam)
        ? projectIdParam[0]
        : projectIdParam;
    const suiteId = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!projectId || !suiteId) {
        return res.status(400).json({ message: "Invalid parameters" });
    }
    const suite = await prisma_1.prisma.testSuite.updateMany({
        where: { id: suiteId, projectId },
        data: {
            isArchived: false,
            archivedAt: null,
        },
    });
    return res.status(200).json(suite);
};
exports.restoreSuiteController = restoreSuiteController;
const addTestCaseToSuiteController = async (req, res) => {
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
    const suite = await prisma_1.prisma.testSuite.findFirst({
        where: { id: suiteId, projectId },
    });
    if (!suite) {
        return res.status(404).json({ message: "Suite not found" });
    }
    const maxPosition = await prisma_1.prisma.testSuiteTestCase.aggregate({
        where: { suiteId },
        _max: { position: true },
    });
    const newPosition = (maxPosition._max.position ?? 0) + 1;
    const relation = await prisma_1.prisma.testSuiteTestCase.create({
        data: {
            suiteId,
            testCaseId,
            position: newPosition,
        },
    });
    return res.status(200).json(relation);
};
exports.addTestCaseToSuiteController = addTestCaseToSuiteController;
const removeTestCaseFromSuiteController = async (req, res) => {
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
    await prisma_1.prisma.testSuiteTestCase.delete({
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
exports.removeTestCaseFromSuiteController = removeTestCaseFromSuiteController;
//# sourceMappingURL=testSuite.controller.js.map