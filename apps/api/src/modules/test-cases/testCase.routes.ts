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

const router: Router = Router({ mergeParams: true });

router.post("/", asHandler(authenticate), asHandler(createTestCaseController));

router.get("/", asHandler(authenticate), asHandler(listTestCasesController));

router.get("/:id", asHandler(authenticate), asHandler(getTestCaseByIdController));

router.put("/:id", asHandler(authenticate), asHandler(updateTestCaseController));

router.delete("/:id", asHandler(authenticate), asHandler(deleteTestCaseController));

router.post("/:id/clone", asHandler(authenticate), asHandler(cloneTestCaseController));

export default router;