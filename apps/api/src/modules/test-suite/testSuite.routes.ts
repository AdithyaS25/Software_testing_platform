import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import {
  createTestSuiteController,
  getTestSuitesController,
  executeSuiteController,
  addTestCaseToSuiteController,
  removeTestCaseFromSuiteController,
  completeSuiteExecutionController,
  getSuiteExecutionReportController,
  reorderSuiteTestCasesController,
  cloneSuiteController,
  archiveSuiteController,
  restoreSuiteController,
} from "./testSuite.controller";

const router: Router = Router({ mergeParams: true }); // ← mergeParams so req.params.projectId is available

// POST /api/projects/:projectId/test-suites
router.post(
  "/",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER, UserRole.ADMIN])),
  asHandler(createTestSuiteController)
);

// GET /api/projects/:projectId/test-suites
router.get(
  "/",
  asHandler(authenticate),
  asHandler(getTestSuitesController)
);

// POST /api/projects/:projectId/test-suites/:id/test-cases
router.post(
  "/:id/test-cases",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER, UserRole.ADMIN])),
  asHandler(addTestCaseToSuiteController)
);

// DELETE /api/projects/:projectId/test-suites/:id/test-cases
router.delete(
  "/:id/test-cases",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER, UserRole.ADMIN])),
  asHandler(removeTestCaseFromSuiteController)
);

// PUT /api/projects/:projectId/test-suites/:id/reorder
router.put(
  "/:id/reorder",
  asHandler(authenticate),
  asHandler(reorderSuiteTestCasesController)
);

// POST /api/projects/:projectId/test-suites/:id/clone
router.post(
  "/:id/clone",
  asHandler(authenticate),
  asHandler(cloneSuiteController)
);

// PATCH /api/projects/:projectId/test-suites/:id/archive
router.patch(
  "/:id/archive",
  asHandler(authenticate),
  asHandler(archiveSuiteController)
);

// PATCH /api/projects/:projectId/test-suites/:id/restore
router.patch(
  "/:id/restore",
  asHandler(authenticate),
  asHandler(restoreSuiteController)
);

// POST /api/projects/:projectId/test-suites/:suiteId/execute
router.post(
  "/:suiteId/execute",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER, UserRole.ADMIN])),
  executeSuiteController
);

// PATCH /api/projects/:projectId/test-suites/executions/:suiteExecutionId/complete
router.patch(
  "/executions/:suiteExecutionId/complete",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER, UserRole.ADMIN])),
  completeSuiteExecutionController
);

// GET /api/projects/:projectId/test-suites/executions/:suiteExecutionId
router.get(
  "/executions/:suiteExecutionId",
  asHandler(authenticate),
  getSuiteExecutionReportController
);

export default router;