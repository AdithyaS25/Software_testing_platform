import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { UserRole } from "@prisma/client";
import { getTestExecutionReport } from "./report.controller";
import { getDashboardController } from "./dashboard.controller";
import { exportTestExecutionController, exportBugReportController } from "./export.controller";

const router: Router = Router({ mergeParams: true }); // ← mergeParams so req.params.projectId is available

// GET /api/projects/:projectId/reports/dashboard
router.get(
  "/dashboard",
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER, UserRole.ADMIN]),
  getDashboardController
);

// GET /api/projects/:projectId/reports/test-execution/:testRunId
router.get(
  "/test-execution/:testRunId",
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER, UserRole.ADMIN]),
  getTestExecutionReport
);

// GET /api/projects/:projectId/reports/export/test-execution/:testRunId
router.get(
  "/export/test-execution/:testRunId",
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER, UserRole.ADMIN]),
  exportTestExecutionController
);

// GET /api/projects/:projectId/reports/export/bugs
router.get(
  "/export/bugs",
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER, UserRole.ADMIN]),
  exportBugReportController
);

export default router;