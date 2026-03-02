import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import {
  createBugController,
  updateBugStatusController,
  getBugsController,
  getMyBugsController,
  assignBugController,
  addBugCommentController,
  getBugCommentsController,
  updateBugCommentController,
  deleteBugCommentController,
} from "./bug.controller";

const router: Router = Router({ mergeParams: true }); // ← mergeParams so req.params.projectId is available

// POST /api/projects/:projectId/bugs
router.post(
  "/",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER, UserRole.ADMIN])),
  asHandler(createBugController)
);

// GET /api/projects/:projectId/bugs/my  ← must be BEFORE /:id routes
router.get(
  "/my",
  asHandler(authenticate),
  asHandler(authorize([UserRole.DEVELOPER, UserRole.ADMIN])),
  asHandler(getMyBugsController)
);

// GET /api/projects/:projectId/bugs
router.get(
  "/",
  asHandler(authenticate),
  asHandler(getBugsController)
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
  asHandler(addBugCommentController)
);

// GET /api/projects/:projectId/bugs/:id/comments
router.get(
  "/:id/comments",
  asHandler(authenticate),
  asHandler(getBugCommentsController)
);

// PATCH /api/projects/:projectId/bugs/comments/:id
router.patch(
  "/comments/:id",
  asHandler(authenticate),
  asHandler(updateBugCommentController)
);

// DELETE /api/projects/:projectId/bugs/comments/:id
router.delete(
  "/comments/:id",
  asHandler(authenticate),
  asHandler(deleteBugCommentController)
);

export default router;