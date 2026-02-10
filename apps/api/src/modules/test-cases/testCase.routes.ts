import { Router } from "express";
import { authenticate } from "../../auth/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import {
  createTestCaseController,
  listTestCasesController,
} from "./testCase.controller";

const router: Router = Router();

router.post(
  "/",
  asHandler(authenticate),
  asHandler(createTestCaseController)
);

router.get(
  "/",
  asHandler(authenticate),
  asHandler(listTestCasesController)
);

export default router;
