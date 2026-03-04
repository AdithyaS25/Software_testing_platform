"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const async_handler_1 = require("../../utils/async-handler");
const execution_controller_1 = require("./execution.controller");
const uploadEvidence_1 = require("../../middleware/uploadEvidence");
const router = (0, express_1.Router)();
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
router.post("/", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.TESTER])), (0, async_handler_1.asHandler)(execution_controller_1.createExecutionController));
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
router.patch("/:id", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.TESTER])), (0, async_handler_1.asHandler)(execution_controller_1.updateExecutionController));
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
router.post("/:id/complete", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.TESTER])), (0, async_handler_1.asHandler)(execution_controller_1.completeExecutionController));
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
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post("/:executionId/steps/:stepId/evidence", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.TESTER])), uploadEvidence_1.uploadEvidence.single("file"), (0, async_handler_1.asHandler)(execution_controller_1.uploadExecutionEvidenceController));
/**
 * @openapi
 * /executions/{executionId}/steps/{stepId}/fail-and-create-bug:
 *   post:
 *     summary: Mark step as FAIL and create linked bug
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
 *     responses:
 *       201:
 *         description: Bug created successfully
 *       400:
 *         description: Validation error
 */
router.post("/:executionId/steps/:stepId/fail-and-create-bug", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.TESTER])), (0, async_handler_1.asHandler)(execution_controller_1.failAndCreateBugController));
exports.default = router;
//# sourceMappingURL=execution.routes.js.map