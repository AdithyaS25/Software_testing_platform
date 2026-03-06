// File: apps/api/src/modules/user/user.routes.ts
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { asHandler } from "../../utils/async-handler";
import { getUsersController } from "./user.controller";

const router: Router = Router();

// GET /api/users?role=DEVELOPER
router.get("/", asHandler(authenticate), asHandler(getUsersController));

export default router;
