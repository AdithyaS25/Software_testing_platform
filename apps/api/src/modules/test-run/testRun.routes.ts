import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import {
  assignTestRunCaseController,
  createTestRunController,
  getAllTestRunsController,
  getTestRunByIdController,
} from "./testRun.controller";

const router: Router = Router();

/**
 * @openapi
 * /test-runs:
 *   post:
 *     summary: Create a new test run
 *     tags:
 *       - Test Run
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
 *               - startDate
 *               - endDate
 *               - testCaseIds
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               testCaseIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Test run created successfully
 */
router.post(
  "/",
  asHandler(authenticate),
  asHandler(authorize([UserRole.ADMIN, UserRole.DEVELOPER])),
  asHandler(createTestRunController)
);

/**
 * @openapi
 * /test-runs:
 *   get:
 *     summary: Get all test runs
 *     tags:
 *       - Test Run
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test runs
 */
router.get(
  "/",
  asHandler(authenticate),
  asHandler(
    authorize([
      UserRole.ADMIN,
      UserRole.DEVELOPER,
      UserRole.TESTER,
    ])
  ),
  asHandler(getAllTestRunsController)
);

/**
 * @openapi
 * /test-runs/{id}:
 *   get:
 *     summary: Get test run by ID
 *     tags:
 *       - Test Run
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
 *         description: Test run details
 */
router.get(
  "/:id",
  asHandler(authenticate),
  asHandler(
    authorize([
      UserRole.ADMIN,
      UserRole.DEVELOPER,
      UserRole.TESTER,
    ])
  ),
  asHandler(getTestRunByIdController)
);

/**
 * @openapi
 * /test-runs/assign:
 *   patch:
 *     summary: Assign a tester to a test case inside a test run
 *     tags:
 *       - Test Run
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - testRunTestCaseId
 *               - assignedToId
 *             properties:
 *               testRunTestCaseId:
 *                 type: string
 *               assignedToId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 */
router.patch(
  "/assign",
  asHandler(authenticate),
  asHandler(authorize([UserRole.ADMIN, UserRole.DEVELOPER])),
  asHandler(assignTestRunCaseController)
);

export default router;
