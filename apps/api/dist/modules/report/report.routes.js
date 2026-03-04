"use strict";
// File: apps/api/src/modules/report/report.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const report_controller_1 = require("./report.controller"); // ← getBugReport added
const dashboard_controller_1 = require("./dashboard.controller");
const export_controller_1 = require("./export.controller");
const router = (0, express_1.Router)({ mergeParams: true });
// GET /api/projects/:projectId/reports/dashboard
router.get("/dashboard", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.DEVELOPER, client_1.UserRole.ADMIN]), dashboard_controller_1.getDashboardController);
// GET /api/projects/:projectId/reports/bugs  ← NEW: JSON stats for the Reports page
router.get("/bugs", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.DEVELOPER, client_1.UserRole.ADMIN]), report_controller_1.getBugReport);
// GET /api/projects/:projectId/reports/test-execution/:testRunId
router.get("/test-execution/:testRunId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.DEVELOPER, client_1.UserRole.ADMIN]), report_controller_1.getTestExecutionReport);
// GET /api/projects/:projectId/reports/export/test-execution/:testRunId
router.get("/export/test-execution/:testRunId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.DEVELOPER, client_1.UserRole.ADMIN]), export_controller_1.exportTestExecutionController);
// GET /api/projects/:projectId/reports/export/bugs  (CSV download — unchanged)
router.get("/export/bugs", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.DEVELOPER, client_1.UserRole.ADMIN]), export_controller_1.exportBugReportController);
exports.default = router;
//# sourceMappingURL=report.routes.js.map