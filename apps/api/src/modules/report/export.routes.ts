import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import {
  exportTestExecutionController,
  exportBugReportController,
} from './export.controller';

const router: Router = Router();

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
router.get(
  '/:projectId/export/test-execution/:testRunId',
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER]),
  exportTestExecutionController
);

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
router.get(
  '/:projectId/export/bugs',
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER, UserRole.ADMIN]),
  exportBugReportController
);

export default router;
