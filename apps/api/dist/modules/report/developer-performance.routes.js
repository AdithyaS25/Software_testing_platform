"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const developer_performance_controller_1 = require("./developer-performance.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /reports/developer-performance:
 *   get:
 *     summary: Generate Developer Performance Report
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Developer performance report generated successfully
 */
router.get("/developer-performance", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.DEVELOPER, client_1.UserRole.ADMIN]), developer_performance_controller_1.getDeveloperPerformanceController);
exports.default = router;
//# sourceMappingURL=developer-performance.routes.js.map