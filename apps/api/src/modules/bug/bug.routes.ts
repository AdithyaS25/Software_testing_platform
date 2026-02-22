import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import { createBugController } from "./bug.controller";

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

export default router;