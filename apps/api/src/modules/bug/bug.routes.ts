// File: apps/api/src/modules/bug/bug.routes.ts
import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import {
  createBugController,
  getBugsController,
  getMyBugsController,
  getBugByIdController,
  updateBugStatusController,
  assignBugController,
  addCommentController,
  deleteCommentController,
  getCommentsController
} from "./bug.controller";

const router: Router = Router({ mergeParams: true });

// POST /api/projects/:projectId/bugs
router.post(
  "/",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER, UserRole.ADMIN])),
  asHandler(createBugController)
);

// GET /api/projects/:projectId/bugs/my  ← must be BEFORE /:id
router.get(
  "/my",
  asHandler(authenticate),
  asHandler(authorize([UserRole.DEVELOPER, UserRole.ADMIN])),
  asHandler(getMyBugsController)
);

// ✅ Fixed: DELETE /comments/:id MUST be registered BEFORE /:id/comments
// Otherwise Express matches "comments" as the :id param on the /:id route
router.delete(
  "/comments/:id",
  asHandler(authenticate),
  asHandler(deleteCommentController)
);

// GET /api/projects/:projectId/bugs
router.get(
  "/",
  asHandler(authenticate),
  asHandler(getBugsController)
);

// GET /api/projects/:projectId/bugs/:id/comments
router.get(
  "/:id/comments",
  asHandler(authenticate),
  asHandler(getCommentsController)
);

// GET /api/projects/:projectId/bugs/:id
router.get(
  "/:id",
  asHandler(authenticate),
  asHandler(getBugByIdController)
);

// PATCH /api/projects/:projectId/bugs/:id/status
router.patch(
  "/:id/status",
  asHandler(authenticate),
  asHandler(updateBugStatusController)
);

// PATCH /api/projects/:projectId/bugs/:id/assign
router.patch(
  "/:id/assign",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER, UserRole.ADMIN])),
  asHandler(assignBugController)
);

// POST /api/projects/:projectId/bugs/:id/comments
router.post(
  "/:id/comments",
  asHandler(authenticate),
  asHandler(addCommentController)
);

export default router;