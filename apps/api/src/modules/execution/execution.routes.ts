import { Router } from "express";
import { authenticate } from "../../auth/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import {
  createExecutionController,
  updateExecutionController,
  completeExecutionController,
} from "./execution.controller";

const router: Router = Router();

router.post(
  "/",
  asHandler(authenticate),
  asHandler(createExecutionController)
);

router.patch(
  "/:id",
  asHandler(authenticate),
  asHandler(updateExecutionController)
);

router.post(
  "/:id/complete",
  asHandler(authenticate),
  asHandler(completeExecutionController)
);

export default router;
