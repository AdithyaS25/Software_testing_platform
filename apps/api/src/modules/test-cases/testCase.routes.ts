import { Router } from "express";
import { authenticate } from "../../auth/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import {
  createTestCaseController,
  listTestCasesController,
  getTestCaseByIdController,
  updateTestCaseController,
  cloneTestCaseController,
  deleteTestCaseController,
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

router.post(
  "/:id/clone",
  asHandler(authenticate),
  asHandler(cloneTestCaseController)
);

router.delete(
  "/:id",
  asHandler(authenticate),
  asHandler(deleteTestCaseController)
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
