import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import { createTestRunController, getAllTestRunsController } from "./testRun.controller";

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
  asHandler(getAllTestRunsController)
);

export default router;
