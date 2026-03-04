"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const tester_performance_controller_1 = require("./tester-performance.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /reports/tester-performance:
 *   get:
 *     summary: Generate Tester Performance Report
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tester performance report generated successfully
 */
router.get("/tester-performance", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.DEVELOPER, client_1.UserRole.ADMIN]), tester_performance_controller_1.getTesterPerformanceController);
exports.default = router;
//# sourceMappingURL=tester-performance.routes.js.map