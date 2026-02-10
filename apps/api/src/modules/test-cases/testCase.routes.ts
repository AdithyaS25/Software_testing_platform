import { Router } from "express";
import { createTestCaseController } from "./testCase.controller";
import { authenticate } from "../../auth/auth.middleware";
import { asHandler } from "../../utils/async-handler";

const router: Router = Router();

router.post(
  "/",
  asHandler(authenticate),
  asHandler(createTestCaseController)
);

export default router;
