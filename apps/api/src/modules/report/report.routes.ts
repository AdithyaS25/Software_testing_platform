import { Router } from "express";
import { UserRole } from "@prisma/client";
import { getTestExecutionReport } from "./report.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router: Router = Router();

/**
 * @swagger
 * /reports/test-execution/{testRunId}:
 *   get:
 *     summary: Generate Test Execution Report
 *     description: Returns execution analytics for a specific test run.
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
 *         description: UUID of the test run
 *     responses:
 *       200:
 *         description: Test execution report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     testRun:
 *                       type: object
 *                     summary:
 *                       type: object
 *                     executionByTester:
 *                       type: array
 *                     executionByModule:
 *                       type: array
 *                     timeline:
 *                       type: array
 *                     failedTestCases:
 *                       type: array
 *       400:
 *         description: Invalid testRunId
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/test-execution/:testRunId",
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER, UserRole.ADMIN]),
  getTestExecutionReport
);

export default router;
