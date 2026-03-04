"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const dashboard_controller_1 = require("./dashboard.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /reports/dashboard:
 *   get:
 *     summary: Get Dashboard Summary Widgets
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/dashboard", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.DEVELOPER, client_1.UserRole.ADMIN]), dashboard_controller_1.getDashboardController);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map