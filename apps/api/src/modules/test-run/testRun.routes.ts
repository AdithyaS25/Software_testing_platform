import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import {
  createTestRunController,
  getAllTestRunsController,
  assignTestRunCaseController,
  getTestRunByIdController,
} from "./testRun.controller";

const router: Router = Router({ mergeParams: true }); // ← mergeParams so req.params.projectId is available

// POST /api/projects/:projectId/test-runs
router.post(
  "/",
  asHandler(authenticate),
  asHandler(authorize([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.TESTER])),
  asHandler(createTestRunController)
);

// GET /api/projects/:projectId/test-runs
router.get(
  "/",
  asHandler(authenticate),
  asHandler(authorize([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.TESTER])),
  asHandler(getAllTestRunsController)
);

// GET /api/projects/:projectId/test-runs/:id
router.get(
  "/:id",
  asHandler(authenticate),
  asHandler(authorize([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.TESTER])),
  asHandler(getTestRunByIdController)
);

// PATCH /api/projects/:projectId/test-runs/assign
router.patch(
  "/assign",
  asHandler(authenticate),
  asHandler(authorize([UserRole.ADMIN, UserRole.DEVELOPER])),
  asHandler(assignTestRunCaseController)
);

export default router;