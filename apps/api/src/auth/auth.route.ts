import { Router } from "express";
import { refreshTokenController, logoutAllController } from "./auth.controller";

const router: Router = Router();

router.post("/refresh", refreshTokenController);
router.post("/logout-all", logoutAllController);

export default router;
