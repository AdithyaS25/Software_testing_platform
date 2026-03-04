"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignTestRunCaseController = exports.getTestRunByIdController = exports.getAllTestRunsController = exports.createTestRunController = void 0;
const testRun_service_1 = require("./testRun.service");
const prisma_1 = require("../../prisma");
const notification_service_1 = require("../notification/notification.service");
/* ============================
   CREATE TEST RUN
============================ */
const createTestRunController = async (req, res) => {
    const authReq = req;
    const projectIdParam = req.params.projectId;
    const projectId = Array.isArray(projectIdParam) ? projectIdParam[0] : projectIdParam;
    if (!projectId)
        return res.status(400).json({ message: "Project ID is required" });
    const { name, description, startDate, endDate, testCaseIds } = req.body;
    const userId = authReq.user?.id;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    const testRun = await (0, testRun_service_1.createTestRunService)(projectId, name, description, new Date(startDate), new Date(endDate), testCaseIds, userId);
    res.status(201).json(testRun);
};
exports.createTestRunController = createTestRunController;
/* ============================
   GET ALL TEST RUNS
============================ */
const getAllTestRunsController = async (req, res) => {
    const projectIdParam = req.params.projectId;
    const projectId = Array.isArray(projectIdParam) ? projectIdParam[0] : projectIdParam;
    if (!projectId)
        return res.status(400).json({ message: "Project ID is required" });
    const runs = await (0, testRun_service_1.getAllTestRunsService)(projectId);
    res.status(200).json(runs);
};
exports.getAllTestRunsController = getAllTestRunsController;
/* ============================
   GET TEST RUN BY ID
============================ */
const getTestRunByIdController = async (req, res) => {
    const projectIdParam = req.params.projectId;
    const idParam = req.params.id;
    const projectId = Array.isArray(projectIdParam) ? projectIdParam[0] : projectIdParam;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!projectId || !id)
        return res.status(400).json({ message: "Invalid parameters" });
    const run = await (0, testRun_service_1.getTestRunByIdService)(projectId, id);
    if (!run)
        return res.status(404).json({ message: "Test run not found" });
    res.status(200).json(run);
};
exports.getTestRunByIdController = getTestRunByIdController;
/* ============================
   ASSIGN TEST RUN CASE
============================ */
const assignTestRunCaseController = async (req, res) => {
    const projectIdParam = req.params.projectId;
    const idParam = req.params.testRunTestCaseId;
    const projectId = Array.isArray(projectIdParam) ? projectIdParam[0] : projectIdParam;
    const testRunTestCaseId = Array.isArray(idParam) ? idParam[0] : idParam;
    const { assignedToId } = req.body;
    if (!projectId || !testRunTestCaseId || !assignedToId) {
        return res.status(400).json({ message: "Invalid parameters" });
    }
    // Fetch the TestRunTestCase with its parent TestRun so we have the name + projectId
    const testRunTestCase = await prisma_1.prisma.testRunTestCase.findUnique({
        where: { id: testRunTestCaseId },
        include: { testRun: true },
    });
    if (!testRunTestCase)
        return res.status(404).json({ message: "Not found" });
    const previousAssignedToId = testRunTestCase.assignedToId;
    const updated = await prisma_1.prisma.testRunTestCase.update({
        where: { id: testRunTestCaseId },
        data: { assignedToId },
    });
    // ── NOTIFICATION: only fire when assignee actually changes ──
    if (assignedToId !== previousAssignedToId) {
        (0, notification_service_1.notifyTestRunAssigned)({
            assignedToId: assignedToId,
            testRunName: testRunTestCase.testRun.name,
            projectId: projectId,
            testRunId: testRunTestCase.testRunId,
        }).catch(console.error);
    }
    return res.status(200).json(updated);
};
exports.assignTestRunCaseController = assignTestRunCaseController;
//# sourceMappingURL=testRun.controller.js.map