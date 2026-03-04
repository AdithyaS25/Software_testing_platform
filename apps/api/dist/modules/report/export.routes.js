"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const export_controller_1 = require("./export.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /reports/test-execution/{testRunId}/export:
 *   get:
 *     summary: Export Test Execution Report as CSV
 *     description: Downloads the Test Execution Report for a specific Test Run in CSV format.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testRunId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Test Run
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid Test Run ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/:projectId/export/test-execution/:testRunId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.DEVELOPER]), export_controller_1.exportTestExecutionController);
/**
 * @swagger
 * /reports/bug/export:
 *   get:
 *     summary: Export Bug Report as CSV
 *     description: Downloads the system-wide Bug Report in CSV format.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/:projectId/export/bugs", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.DEVELOPER, client_1.UserRole.ADMIN]), export_controller_1.exportBugReportController);
exports.default = router;
//# sourceMappingURL=export.routes.js.map