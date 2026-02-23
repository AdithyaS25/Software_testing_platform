import { Router } from "express";
import { asHandler } from "../../utils/async-handler";
import { authenticate } from "../../middleware/auth.middleware";
import {
  createTestCaseController,
  listTestCasesController,
  cloneTestCaseController,
  deleteTestCaseController,
  getTestCaseByIdController,
  updateTestCaseController,
} from "./testCase.controller";

const router: Router = Router();

/**
 * @swagger
 * /test-cases:
 *   post:
 *     summary: Create a new test case
 *     tags:
 *       - Test Case
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - module
 *               - priority
 *               - severity
 *               - type
 *               - status
 *               - automationStatus
 *               - tags
 *               - steps
 *             properties:
 *               title:
 *                 type: string
 *                 example: Verify login
 *               description:
 *                 type: string
 *                 example: Validate successful login
 *               module:
 *                 type: string
 *                 example: Authentication
 *               priority:
 *                 type: string
 *                 enum: [CRITICAL, HIGH, MEDIUM, LOW]
 *               severity:
 *                 type: string
 *                 enum: [BLOCKER, CRITICAL, MAJOR, MINOR, TRIVIAL]
 *               type:
 *                 type: string
 *                 enum: [FUNCTIONAL, REGRESSION, SMOKE, INTEGRATION, UAT, PERFORMANCE, SECURITY, USABILITY]
 *               status:
 *                 type: string
 *                 enum: [DRAFT, READY_FOR_REVIEW, APPROVED, DEPRECATED, ARCHIVED]
 *               automationStatus:
 *                 type: string
 *                 enum: [NOT_AUTOMATED, IN_PROGRESS, AUTOMATED, CANNOT_AUTOMATE]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["login", "smoke"]
 *               steps:
 *                 type: array
 *                 description: List of test steps
 *                 items:
 *                   type: object
 *                   required:
 *                     - stepNumber
 *                     - action
 *                     - expectedResult
 *                   properties:
 *                     stepNumber:
 *                       type: integer
 *                       example: 1
 *                     action:
 *                       type: string
 *                       example: Enter valid username and password
 *                     expectedResult:
 *                       type: string
 *                       example: User should be logged in successfully
 *     responses:
 *       201:
 *         description: Test case created successfully
 *       400:
 *         description: Invalid request body
 */
router.post("/", asHandler(authenticate), asHandler(createTestCaseController));

/**
 * @swagger
 * /test-cases:
 *   get:
 *     summary: Get all test cases
 *     tags:
 *       - Test Case
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of test cases
 */
router.get("/", asHandler(authenticate), asHandler(listTestCasesController));

/**
 * @swagger
 * /test-cases/{id}:
 *   get:
 *     summary: Get a test case by ID
 *     tags:
 *       - Test Case
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
 *         description: Test case details
 *       404:
 *         description: Test case not found
 */
router.get("/:id", asHandler(authenticate), asHandler(getTestCaseByIdController));

/**
 * @swagger
 * /test-cases/{id}:
 *   put:
 *     summary: Update a test case
 *     tags:
 *       - Test Case
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [CRITICAL, HIGH, MEDIUM, LOW]
 *               severity:
 *                 type: string
 *                 enum: [BLOCKER, CRITICAL, MAJOR, MINOR, TRIVIAL]
 *               status:
 *                 type: string
 *                 enum: [DRAFT, READY_FOR_REVIEW, APPROVED, DEPRECATED, ARCHIVED]
 *     responses:
 *       200:
 *         description: Test case updated successfully
 */
router.put("/:id", asHandler(authenticate), asHandler(updateTestCaseController));

/**
 * @swagger
 * /test-cases/{id}:
 *   delete:
 *     summary: Delete a test case
 *     tags:
 *       - Test Case
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
 *         description: Test case deleted successfully
 *       404:
 *         description: Test case not found
 */
router.delete("/:id", asHandler(authenticate), asHandler(deleteTestCaseController));

/**
 * @swagger
 * /test-cases/{id}/clone:
 *   post:
 *     summary: Clone a test case
 *     tags:
 *       - Test Case
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Test case cloned successfully
 *       404:
 *         description: Test case not found
 */
router.post("/:id/clone", asHandler(authenticate), asHandler(cloneTestCaseController));

export default router;