"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const async_handler_1 = require("../../utils/async-handler");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const testCase_controller_1 = require("./testCase.controller");
const router = (0, express_1.Router)({ mergeParams: true });
router.post("/", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(testCase_controller_1.createTestCaseController));
router.get("/", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(testCase_controller_1.listTestCasesController));
router.get("/:id", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(testCase_controller_1.getTestCaseByIdController));
router.put("/:id", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(testCase_controller_1.updateTestCaseController));
router.delete("/:id", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(testCase_controller_1.deleteTestCaseController));
router.post("/:id/clone", (0, async_handler_1.asHandler)(auth_middleware_1.authenticate), (0, async_handler_1.asHandler)(testCase_controller_1.cloneTestCaseController));
exports.default = router;
//# sourceMappingURL=testCase.routes.js.map