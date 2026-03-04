"use strict";
// File: apps/api/src/modules/execution/execution.controller.ts
// FIX: failAndCreateBugController used hardcoded 'default-project-001' for projectId.
// Now reads projectId from execution.testCase.projectId properly.
// Also: priority/severity use enum values (P3_MEDIUM not P3-MEDIUM).
Object.defineProperty(exports, "__esModule", { value: true });
exports.failAndCreateBugController = exports.uploadExecutionEvidenceController = exports.completeExecutionController = exports.updateExecutionController = exports.createExecutionController = void 0;
const prisma_1 = require("../../prisma");
const execution_service_1 = require("./execution.service");
const client_1 = require("@prisma/client");
const createExecutionController = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    const { testCaseId, testRunId } = req.body;
    if (!testCaseId || !testRunId)
        return res.status(400).json({ message: "testCaseId and testRunId are required" });
    const execution = await (0, execution_service_1.createExecutionService)(testCaseId, testRunId, userId);
    return res.status(201).json({ message: "Execution created successfully", data: execution });
};
exports.createExecutionController = createExecutionController;
const updateExecutionController = async (req, res) => {
    const executionId = String(req.params.id);
    if (!executionId)
        return res.status(400).json({ message: "Invalid execution ID" });
    const updated = await (0, execution_service_1.updateExecutionService)(executionId, req.body);
    return res.status(200).json({ message: "Execution updated successfully", data: updated });
};
exports.updateExecutionController = updateExecutionController;
const completeExecutionController = async (req, res) => {
    const executionId = String(req.params.id);
    if (!executionId)
        return res.status(400).json({ message: "Invalid execution ID" });
    const completed = await (0, execution_service_1.completeExecutionService)(executionId);
    return res.status(200).json({ message: "Execution completed successfully", data: completed });
};
exports.completeExecutionController = completeExecutionController;
const uploadExecutionEvidenceController = async (req, res) => {
    try {
        const executionId = String(req.params.executionId);
        const stepId = String(req.params.stepId);
        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });
        const execution = await prisma_1.prisma.execution.findUnique({ where: { id: executionId } });
        if (!execution)
            return res.status(404).json({ message: "Execution not found" });
        if (execution.status === "COMPLETED")
            return res.status(400).json({ message: "Cannot upload evidence. Execution already completed." });
        const step = await prisma_1.prisma.executionStep.findUnique({ where: { id: stepId } });
        if (!step || step.executionId !== executionId)
            return res.status(404).json({ message: "Execution step not found" });
        const updated = await prisma_1.prisma.executionStep.update({
            where: { id: stepId }, // stepId is already String() above
            data: { evidenceUrl: `/uploads/${req.file.filename}` },
        });
        return res.status(200).json({ message: "Evidence uploaded successfully", data: updated });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.uploadExecutionEvidenceController = uploadExecutionEvidenceController;
const failAndCreateBugController = async (req, res) => {
    const { executionId, stepId } = req.params;
    try {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const execution = await tx.execution.findUnique({
                where: { id: String(executionId) },
                include: { testCase: true },
            });
            if (!execution)
                throw new Error("Execution not found");
            if (execution.status === "COMPLETED")
                throw new Error("Execution already completed");
            const step = await tx.executionStep.findUnique({ where: { id: String(stepId) } });
            if (!step || step.executionId !== executionId)
                throw new Error("Execution step not found");
            await tx.executionStep.update({ where: { id: String(stepId) }, data: { status: "FAIL" } });
            const bugCount = await tx.bug.count({ where: { projectId: execution.testCase.projectId } });
            const bugId = `BUG-${new Date().getFullYear()}-${String(bugCount + 1).padStart(5, "0")}`;
            // Accept overrides from request body (title, description, severity, priority)
            const body = req.body || {};
            return tx.bug.create({
                data: {
                    bugId,
                    title: body.title || `Failure in step ${step.stepNumber} of ${execution.testCase.title}`,
                    description: body.description || `Auto-created from execution failure.`,
                    expectedBehavior: step.expectedResult ?? "Expected result not provided",
                    actualBehavior: step.actualResult ?? "Actual result not provided",
                    severity: body.severity || client_1.BugSeverity.MAJOR,
                    // FIX: was hardcoded BugPriority.P3_MEDIUM — now accepts from body
                    priority: body.priority || client_1.BugPriority.P3_MEDIUM,
                    status: client_1.BugStatus.NEW,
                    testCaseId: execution.testCaseId,
                    executionId,
                    executionStepId: String(stepId),
                    // FIX: was hardcoded 'default-project-001' — now uses actual projectId
                    projectId: execution.testCase.projectId,
                },
            });
        });
        return res.status(201).json({ message: "Bug created successfully", data: result });
    }
    catch (error) {
        if (error instanceof Error)
            return res.status(400).json({ message: error.message });
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.failAndCreateBugController = failAndCreateBugController;
//# sourceMappingURL=execution.controller.js.map