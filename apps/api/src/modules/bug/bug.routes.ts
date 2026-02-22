import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import { createBugController, updateBugStatusController } from "./bug.controller";

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

export default router;