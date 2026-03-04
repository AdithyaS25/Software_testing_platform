"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bug_report_controller_1 = require("./bug-report.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /reports/bug:
 *   get:
 *     summary: Generate Bug Report
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bug report generated successfully
 */
router.get("/bug", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.DEVELOPER, client_1.UserRole.ADMIN]), bug_report_controller_1.getBugReportController);
exports.default = router;
//# sourceMappingURL=bug-report.routes.js.map