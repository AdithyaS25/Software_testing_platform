"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const async_handler_1 = require("../../utils/async-handler");
const bug_controller_1 = require("./bug.controller");
const router = (0, express_1.Router)({ mergeParams: true });
// POST /api/projects/:projectId/bugs
router.post("/", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.ADMIN])), (0, async_handler_1.asHandler)(bug_controller_1.createBugController));
// GET /api/projects/:projectId/bugs/my  ← must be BEFORE /:id
router.get("/my", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.DEVELOPER, client_1.UserRole.ADMIN])), (0, async_handler_1.asHandler)(bug_controller_1.getMyBugsController));
// GET /api/projects/:projectId/bugs
router.get("/", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(bug_controller_1.getBugsController));
// GET /api/projects/:projectId/bugs/:id
router.get("/:id", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(bug_controller_1.getBugByIdController));
// PATCH /api/projects/:projectId/bugs/:id/status
router.patch("/:id/status", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(bug_controller_1.updateBugStatusController));
// PATCH /api/projects/:projectId/bugs/:id/assign
router.patch("/:id/assign", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)((0, auth_middleware_1.authorize)([client_1.UserRole.TESTER, client_1.UserRole.ADMIN])), (0, async_handler_1.asHandler)(bug_controller_1.assignBugController));
// POST /api/projects/:projectId/bugs/:id/comments
router.post("/:id/comments", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(bug_controller_1.addCommentController));
// DELETE /api/projects/:projectId/bugs/comments/:id
router.delete("/comments/:id", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(bug_controller_1.deleteCommentController));
exports.default = router;
//# sourceMappingURL=bug.routes.js.map