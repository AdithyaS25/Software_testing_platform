import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import {
  createTestSuiteController,
  getTestSuitesController,
  addTestCaseToSuiteController,
  removeTestCaseFromSuiteController,
  executeSuiteController,
  completeSuiteExecutionController,
  getSuiteExecutionReportController,
  reorderSuiteTestCasesController,
  cloneSuiteController,
  archiveSuiteController,
  restoreSuiteController
} from "./testSuite.controller";
import { completeExecutionController } from "../execution/execution.controller";

const router: Router = Router();

/**
 * @openapi
 * /test-suites:
 *   post:
 *     summary: Create a new test suite
 *     tags:
 *       - Test Suite
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Test suite created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER])),
  asHandler(createTestSuiteController)
);

/**
 * @openapi
 * /test-suites:
 *   get:
 *     summary: Get all test suites with associated test cases
 *     tags:
 *       - Test Suite
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test suites
 */
router.get(
  "/",
  asHandler(authenticate),
  asHandler(getTestSuitesController)
);

/**
 * @openapi
 * /test-suites/{id}/test-cases:
 *   post:
 *     summary: Add a test case to a test suite
 *     tags:
 *       - Test Suite
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test Suite ID
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
 *                 description: ID of the test case to add
 *     responses:
 *       200:
 *         description: Test case added to suite successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Suite or Test Case not found
 */
router.post(
  "/:id/test-cases",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER])),
  asHandler(addTestCaseToSuiteController)
);

/**
 * @openapi
 * /test-suites/{id}/test-cases:
 *   delete:
 *     summary: Remove a test case from a test suite
 *     tags:
 *       - Test Suite
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test Suite ID
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
 *       200:
 *         description: Test case removed successfully
 */
router.delete(
  "/:id/test-cases",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER])),
  asHandler(removeTestCaseFromSuiteController)
);

/**
 * @openapi
 * /test-suites/{id}/test-cases:
 *   delete:
 *     summary: Remove a test case from a test suite
 *     tags:
 *       - Test Suite
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test Suite ID
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
 *       200:
 *         description: Test case removed successfully
 */
router.delete(
  "/:id/test-cases",
  asHandler(authenticate),
  asHandler(removeTestCaseFromSuiteController)
);

/**
 * @openapi
 * /test-suites/{id}/reorder:
 *   put:
 *     summary: Reorder test cases within a test suite
 *     tags:
 *       - Test Suite
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test Suite ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderedTestCaseIds
 *             properties:
 *               orderedTestCaseIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Suite reordered successfully
 */
router.put(
  "/:id/reorder",
  asHandler(authenticate),
  asHandler(reorderSuiteTestCasesController)
);

/**
 * @openapi
 * /test-suites/{id}/clone:
 *   post:
 *     summary: Clone an entire test suite
 *     tags:
 *       - Test Suite
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Original Test Suite ID
 *     responses:
 *       201:
 *         description: Suite cloned successfully
 */
router.post(
  "/:id/clone",
  asHandler(authenticate),
  asHandler(cloneSuiteController)
);

/**
 * @openapi
 * /test-suites/{id}/archive:
 *   patch:
 *     summary: Archive a test suite
 *     tags:
 *       - Test Suite
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test Suite ID
 *     responses:
 *       200:
 *         description: Suite archived successfully
 */
router.patch(
  "/:id/archive",
  asHandler(authenticate),
  asHandler(archiveSuiteController)
);

/**
 * @openapi
 * /test-suites/{id}/restore:
 *   patch:
 *     summary: Restore an archived test suite
 *     tags:
 *       - Test Suite
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test Suite ID
 *     responses:
 *       200:
 *         description: Suite restored successfully
 */
router.patch(
  "/:id/restore",
  asHandler(authenticate),
  asHandler(restoreSuiteController)
);

/**
 * @openapi
 * /test-suites/{suiteId}/execute:
 *   post:
 *     summary: Execute entire test suite
 *     tags: [Test Suite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: suiteId
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
 *               - executionMode
 *             properties:
 *               executionMode:
 *                 type: string
 *                 enum: [SEQUENTIAL, PARALLEL]
 *     responses:
 *       201:
 *         description: Suite execution started successfully
 */
router.post(
  "/:suiteId/execute",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER])),
  executeSuiteController
);

/**
 * @swagger
 * /test-suites/executions/{suiteExecutionId}/complete:
 *   patch:
 *     summary: Complete a suite execution and generate summary
 *     tags:
 *       - Test Suite
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: suiteExecutionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Suite execution completed successfully
 */
router.patch(
  "/executions/:suiteExecutionId/complete",
  asHandler(authenticate),
  asHandler(authorize([UserRole.TESTER])),
  completeSuiteExecutionController
);

/**
 * @openapi
 * /test-suites/executions/{suiteExecutionId}:
 *   get:
 *     summary: Get consolidated suite execution report
 *     tags:
 *       - Test Suite
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: suiteExecutionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Suite Execution
 *     responses:
 *       200:
 *         description: Consolidated suite execution report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suite:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     module:
 *                       type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalTests:
 *                       type: integer
 *                     passed:
 *                       type: integer
 *                     failed:
 *                       type: integer
 *                     blocked:
 *                       type: integer
 *                     skipped:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [IN_PROGRESS, COMPLETED]
 *                     startedAt:
 *                       type: string
 *                       format: date-time
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                 executions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       executionId:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [IN_PROGRESS, PASSED, FAILED, BLOCKED, SKIPPED]
 *                       testCase:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           module:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Suite execution not found
 */
router.get(
  "/executions/:suiteExecutionId",
  asHandler(authenticate),
  asHandler(getSuiteExecutionReportController)
);

export default router;
