// File: apps/api/src/modules/test-run/testRun.routes.ts
import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asHandler } from '../../utils/async-handler';
import {
  createTestRunController,
  getAllTestRunsController,
  assignTestRunCaseController,
  getTestRunByIdController,
  deleteTestRunController, // ✅ new
} from './testRun.controller';

const router: Router = Router({ mergeParams: true });

// POST /api/projects/:projectId/test-runs
router.post(
  '/',
  asHandler(authenticate),
  asHandler(authorize([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.TESTER])),
  asHandler(createTestRunController)
);

// GET /api/projects/:projectId/test-runs
router.get(
  '/',
  asHandler(authenticate),
  asHandler(authorize([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.TESTER])),
  asHandler(getAllTestRunsController)
);

// GET /api/projects/:projectId/test-runs/:id
router.get(
  '/:id',
  asHandler(authenticate),
  asHandler(authorize([UserRole.ADMIN, UserRole.DEVELOPER, UserRole.TESTER])),
  asHandler(getTestRunByIdController)
);

// ✅ Added: DELETE /api/projects/:projectId/test-runs/:id
router.delete(
  '/:id',
  asHandler(authenticate),
  asHandler(authorize([UserRole.ADMIN, UserRole.TESTER])),
  asHandler(deleteTestRunController)
);

// PATCH /api/projects/:projectId/test-runs/assign
router.patch(
  '/assign',
  asHandler(authenticate),
  asHandler(authorize([UserRole.ADMIN, UserRole.DEVELOPER])),
  asHandler(assignTestRunCaseController)
);

export default router;
