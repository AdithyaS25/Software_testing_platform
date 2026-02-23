import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import {
  createTestSuiteController,
  getTestSuitesController,
  addTestCaseToSuiteController,
  removeTestCaseFromSuiteController,
} from "./testSuite.controller";

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

export default router;
