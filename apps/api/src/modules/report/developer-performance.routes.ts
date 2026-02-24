import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { UserRole } from "@prisma/client";
import { getDeveloperPerformanceController } from "./developer-performance.controller";

const router: Router = Router();

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
router.get(
  "/developer-performance",
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER]),
  getDeveloperPerformanceController
);

export default router;