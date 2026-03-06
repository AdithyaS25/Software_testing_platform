// File: apps/api/src/modules/report/report.routes.ts

import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import { getTestExecutionReport, getBugReport } from './report.controller'; // ← getBugReport added
import { getDashboardController } from './dashboard.controller';
import {
  exportTestExecutionController,
  exportBugReportController,
} from './export.controller';

const router: Router = Router({ mergeParams: true });

// GET /api/projects/:projectId/reports/dashboard
router.get(
  '/dashboard',
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER, UserRole.ADMIN]),
  getDashboardController
);

// GET /api/projects/:projectId/reports/bugs  ← NEW: JSON stats for the Reports page
router.get(
  '/bugs',
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER, UserRole.ADMIN]),
  getBugReport
);

// GET /api/projects/:projectId/reports/test-execution/:testRunId
router.get(
  '/test-execution/:testRunId',
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER, UserRole.ADMIN]),
  getTestExecutionReport
);

// GET /api/projects/:projectId/reports/export/test-execution/:testRunId
router.get(
  '/export/test-execution/:testRunId',
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER, UserRole.ADMIN]),
  exportTestExecutionController
);

// GET /api/projects/:projectId/reports/export/bugs  (CSV download — unchanged)
router.get(
  '/export/bugs',
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER, UserRole.ADMIN]),
  exportBugReportController
);

export default router;
