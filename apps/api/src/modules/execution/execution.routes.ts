import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import {
  createExecutionController,
  updateExecutionController,
  completeExecutionController,
  uploadExecutionEvidenceController,
} from "./execution.controller";
import { upload } from "../../middleware/upload.middleware";

const router: Router = Router();

/**
 * @openapi
 * /executions:
 *   post:
 *     summary: Create execution from test case
 *     tags:
 *       - Execution
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - testCaseId
 *             properties:
 *               testCaseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Execution created successfully
 */
router.post(
  "/",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER])),
  asHandler(createExecutionController)
);

/**
 * @openapi
 * /executions/{id}:
 *   patch:
 *     summary: Update execution steps
 *     tags:
 *       - Execution
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
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [PASS, FAIL, BLOCKED]
 *                     actualResult:
 *                       type: string
 *                     notes:
 *                       type: string
 *     responses:
 *       200:
 *         description: Execution updated successfully
 */
router.patch(
  "/:id",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER])),
  asHandler(updateExecutionController)
);

/**
 * @openapi
 * /executions/{id}/complete:
 *   post:
 *     summary: Complete execution and compute overall result
 *     tags:
 *       - Execution
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
 *         description: Execution completed
 */
router.post(
  "/:id/complete",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER])),
  asHandler(completeExecutionController)
);

/**
 * @openapi
 * /executions/{executionId}/steps/{stepId}/evidence:
 *   post:
 *     summary: Upload evidence for execution step
 *     tags:
 *       - Execution
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Evidence uploaded successfully
 */
router.post(
  "/:executionId/steps/:stepId/evidence",
  asHandler(authenticate),
  upload.single("file"),
  asHandler(uploadExecutionEvidenceController)
);

export default router;