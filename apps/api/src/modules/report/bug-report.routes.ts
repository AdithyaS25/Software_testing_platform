import { Router } from "express";
import { getBugReportController } from "./bug-report.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { UserRole } from "@prisma/client";

const router: Router = Router();

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
router.get(
  "/bug",
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER]),
  getBugReportController
);

export default router;