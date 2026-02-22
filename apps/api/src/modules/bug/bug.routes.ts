import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import { createBugController, 
    updateBugStatusController, 
    getBugsController, 
    getMyBugsController,
    assignBugController,
    addBugCommentController,
    getBugCommentsController,
    updateBugCommentController,
    deleteBugCommentController } from "./bug.controller";

const router: Router = Router();

/**
 * @openapi
 * /bugs:
 *   post:
 *     summary: Create a new bug report
 *     tags:
 *       - Bug
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Bug created successfully
 */
router.post(
  "/",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER])),
  asHandler(createBugController)
);

/**
 * @openapi
 * /bugs/{id}/status:
 *   patch:
 *     summary: Update bug status (workflow enforced)
 *     tags:
 *       - Bug
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bug status updated
 */
router.patch(
  "/:id/status",
  asHandler(authenticate),
  asHandler(updateBugStatusController)
);

/**
 * @openapi
 * /bugs/my:
 *   get:
 *     summary: Get bugs assigned to current developer
 *     tags:
 *       - Bug
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned bugs
 */
router.get(
  "/my",
  asHandler(authenticate),
  asHandler(authorize([UserRole.DEVELOPER])),
  asHandler(getMyBugsController)
);

/**
 * @openapi
 * /bugs:
 *   get:
 *     summary: Get bugs with filters
 *     tags:
 *       - Bug
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *       - in: query
 *         name: priority
 *       - in: query
 *         name: severity
 *       - in: query
 *         name: sortBy
 *       - in: query
 *         name: order
 *     responses:
 *       200:
 *         description: Filtered bugs
 */
router.get(
  "/",
  asHandler(authenticate),
  asHandler(getBugsController)
);

/**
 * @openapi
 * /bugs/{id}/assign:
 *   patch:
 *     summary: Assign bug to developer
 *     tags:
 *       - Bug
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignedToId
 *             properties:
 *               assignedToId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bug assigned successfully
 */
router.patch(
  "/:id/assign",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER])),
  asHandler(assignBugController)
);

/**
 * @openapi
 * /bugs/{id}/comments:
 *   post:
 *     summary: Add comment to bug
 *     tags:
 *       - Bug
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post(
  "/:id/comments",
  asHandler(authenticate),
  asHandler(addBugCommentController)
);

/**
 * @openapi
 * /bugs/{id}/comments:
 *   get:
 *     summary: Get comments for bug
 *     tags:
 *       - Bug
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get(
  "/:id/comments",
  asHandler(authenticate),
  asHandler(getBugCommentsController)
);

/**
 * @openapi
 * /bugs/comments/{id}:
 *   patch:
 *     summary: Edit a bug comment (within 5 minutes)
 *     tags:
 *       - Bug
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 */
router.patch(
  "/comments/:id",
  asHandler(authenticate),
  asHandler(updateBugCommentController)
);

/**
 * @openapi
 * /bugs/comments/{id}:
 *   delete:
 *     summary: Delete a bug comment (within 5 minutes)
 *     tags:
 *       - Bug
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.delete(
  "/comments/:id",
  asHandler(authenticate),
  asHandler(deleteBugCommentController)
);

export default router;