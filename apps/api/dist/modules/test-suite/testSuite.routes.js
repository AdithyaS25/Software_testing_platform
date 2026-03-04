"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const async_handler_1 = require("../../utils/async-handler");
const testSuite_controller_1 = require("./testSuite.controller");
const router = (0, express_1.Router)({ mergeParams: true }); // ← mergeParams so req.params.projectId is available
// POST /api/projects/:projectId/test-suites
router.post("/", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.ADMIN])), (0, async_handler_1.asHandler)(testSuite_controller_1.createTestSuiteController));
// GET /api/projects/:projectId/test-suites
router.get("/", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(testSuite_controller_1.getTestSuitesController));
// POST /api/projects/:projectId/test-suites/:id/test-cases
router.post("/:id/test-cases", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.ADMIN])), (0, async_handler_1.asHandler)(testSuite_controller_1.addTestCaseToSuiteController));
// DELETE /api/projects/:projectId/test-suites/:id/test-cases
router.delete("/:id/test-cases", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.ADMIN])), (0, async_handler_1.asHandler)(testSuite_controller_1.removeTestCaseFromSuiteController));
// PUT /api/projects/:projectId/test-suites/:id/reorder
router.put("/:id/reorder", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(testSuite_controller_1.reorderSuiteTestCasesController));
// POST /api/projects/:projectId/test-suites/:id/clone
router.post("/:id/clone", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(testSuite_controller_1.cloneSuiteController));
// PATCH /api/projects/:projectId/test-suites/:id/archive
router.patch("/:id/archive", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(testSuite_controller_1.archiveSuiteController));
// PATCH /api/projects/:projectId/test-suites/:id/restore
router.patch("/:id/restore", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(testSuite_controller_1.restoreSuiteController));
// POST /api/projects/:projectId/test-suites/:suiteId/execute
router.post("/:suiteId/execute", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.ADMIN])), testSuite_controller_1.executeSuiteController);
// PATCH /api/projects/:projectId/test-suites/executions/:suiteExecutionId/complete
router.patch("/executions/:suiteExecutionId/complete", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.ADMIN])), testSuite_controller_1.completeSuiteExecutionController);
// GET /api/projects/:projectId/test-suites/executions/:suiteExecutionId
router.get("/executions/:suiteExecutionId", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), testSuite_controller_1.getSuiteExecutionReportController);
exports.default = router;
//# sourceMappingURL=testSuite.routes.js.map