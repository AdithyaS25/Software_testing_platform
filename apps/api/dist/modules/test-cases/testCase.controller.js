"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestCaseController = createTestCaseController;
exports.listTestCasesController = listTestCasesController;
exports.getTestCaseByIdController = getTestCaseByIdController;
exports.updateTestCaseController = updateTestCaseController;
exports.cloneTestCaseController = cloneTestCaseController;
exports.deleteTestCaseController = deleteTestCaseController;
const testCase_schema_1 = require("./testCase.schema");
const testCase_service_1 = require("./testCase.service");
const getAuthUser_1 = require("../../utils/getAuthUser");
/* ============================
   CREATE TEST CASE
============================ */
async function createTestCaseController(req, res) {
    try {
        const parsed = testCase_schema_1.createTestCaseSchema.safeParse(req.body);
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
        const user = (0, getAuthUser_1.getAuthUser)(req);
        const testCase = await (0, testCase_service_1.createTestCase)(projectId, parsed.data, user.id);
        return res.status(201).json({
            message: "Test case created successfully",
            data: testCase,
        });
    }
    catch (err) {
        console.error("❌ createTestCase error:", err);
        return res.status(500).json({ message: err?.message ?? "Failed to create test case" });
    }
}
/* ============================
   LIST TEST CASES
============================ */
async function listTestCasesController(req, res) {
    const parsed = testCase_schema_1.listTestCasesQuerySchema.safeParse(req.query);
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
    const user = (0, getAuthUser_1.getAuthUser)(req);
    const params = {
        page,
        limit,
        userId: user.id,
        role: user.role,
    };
    if (status !== undefined)
        params.status = status;
    if (priority !== undefined)
        params.priority = priority;
    if (module !== undefined)
        params.module = module;
    if (search !== undefined)
        params.search = search;
    const result = await (0, testCase_service_1.listTestCases)(projectId, params);
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
async function getTestCaseByIdController(req, res) {
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
    const user = (0, getAuthUser_1.getAuthUser)(req);
    const testCase = await (0, testCase_service_1.getTestCaseById)(projectId, id, user.id, user.role);
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
async function updateTestCaseController(req, res) {
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
    const parsed = testCase_schema_1.updateTestCaseSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid request body",
            errors: parsed.error.flatten(),
        });
    }
    const user = (0, getAuthUser_1.getAuthUser)(req);
    const updated = await (0, testCase_service_1.updateTestCase)(projectId, id, parsed.data, user.id, user.role);
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
async function cloneTestCaseController(req, res) {
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
    const user = (0, getAuthUser_1.getAuthUser)(req);
    const cloned = await (0, testCase_service_1.cloneTestCase)(projectId, id, user.id, user.role);
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
async function deleteTestCaseController(req, res) {
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
    const user = (0, getAuthUser_1.getAuthUser)(req);
    const deleted = await (0, testCase_service_1.deleteTestCase)(projectId, id, user.id, user.role);
    if (!deleted) {
        return res.status(404).json({
            message: "Test case not found",
        });
    }
    return res.status(200).json({
        message: "Test case archived successfully",
    });
}
//# sourceMappingURL=testCase.controller.js.map