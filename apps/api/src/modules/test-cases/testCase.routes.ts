import { Router } from "express";
import { authenticate } from "../../auth/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import {
  createTestCaseController,
  listTestCasesController,
  getTestCaseByIdController,
  updateTestCaseController,
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

router.get(
  "/:id",
  asHandler(authenticate),
  asHandler(getTestCaseByIdController)
);

router.put(
  "/:id",
  asHandler(authenticate),
  asHandler(updateTestCaseController)
);

export default router;
