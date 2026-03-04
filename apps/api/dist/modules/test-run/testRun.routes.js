"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const async_handler_1 = require("../../utils/async-handler");
const testRun_controller_1 = require("./testRun.controller");
const router = (0, express_1.Router)({ mergeParams: true }); // ← mergeParams so req.params.projectId is available
// POST /api/projects/:projectId/test-runs
router.post("/", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.ADMIN, client_1.UserRole.DEVELOPER, client_1.UserRole.TESTER])), (0, async_handler_1.asHandler)(testRun_controller_1.createTestRunController));
// GET /api/projects/:projectId/test-runs
router.get("/", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.ADMIN, client_1.UserRole.DEVELOPER, client_1.UserRole.TESTER])), (0, async_handler_1.asHandler)(testRun_controller_1.getAllTestRunsController));
// GET /api/projects/:projectId/test-runs/:id
router.get("/:id", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.ADMIN, client_1.UserRole.DEVELOPER, client_1.UserRole.TESTER])), (0, async_handler_1.asHandler)(testRun_controller_1.getTestRunByIdController));
// PATCH /api/projects/:projectId/test-runs/assign
router.patch("/assign", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.ADMIN, client_1.UserRole.DEVELOPER])), (0, async_handler_1.asHandler)(testRun_controller_1.assignTestRunCaseController));
exports.default = router;
//# sourceMappingURL=testRun.routes.js.map