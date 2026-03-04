"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_1 = require("../../middleware/validate");
const controller = __importStar(require("./project.controller"));
const project_schema_1 = require("./project.schema");
const testSuite_routes_1 = __importDefault(require("../test-suite/testSuite.routes"));
const testRun_routes_1 = __importDefault(require("../test-run/testRun.routes"));
const bug_routes_1 = __importDefault(require("../bug/bug.routes"));
const testCase_routes_1 = __importDefault(require("../test-cases/testCase.routes"));
const execution_routes_1 = __importDefault(require("../execution/execution.routes"));
const report_routes_1 = __importDefault(require("../report/report.routes"));
const router = (0, express_1.Router)();
/* =======================
   GLOBAL AUTH FOR PROJECTS
======================= */
router.use(auth_middleware_1.authenticate);
/* =======================
   PROJECT CRUD
======================= */
// GET  /api/projects
router.get("/", controller.getAllProjects);
// POST /api/projects
router.post("/", (0, validate_1.validate)(project_schema_1.createProjectSchema), controller.createProject);
// GET /api/projects/:projectId
router.get("/:projectId", (0, validate_1.validate)(project_schema_1.projectIdParamSchema), controller.getProjectById);
// PATCH /api/projects/:projectId
router.patch("/:projectId", (0, validate_1.validate)(project_schema_1.updateProjectSchema), controller.updateProject);
// DELETE /api/projects/:projectId
router.delete("/:projectId", controller.deleteProject);
/* =======================
   PROJECT SETTINGS
======================= */
// Members
// GET /api/projects/:projectId/members
router.get("/:projectId/members", controller.getMembers // no validate() — accepts any string projectId
);
router.post("/:projectId/members", (0, validate_1.validate)(project_schema_1.addMembersSchema), controller.addMembers);
router.delete("/:projectId/members/:userId", (0, validate_1.validate)(project_schema_1.projectIdParamSchema), controller.removeMember);
// Environments
router.post("/:projectId/environments", (0, validate_1.validate)(project_schema_1.upsertEnvironmentSchema), controller.upsertEnvironment);
router.put("/:projectId/environments/:envId", (0, validate_1.validate)(project_schema_1.upsertEnvironmentSchema), controller.upsertEnvironment);
router.delete("/:projectId/environments/:envId", (0, validate_1.validate)(project_schema_1.projectIdParamSchema), controller.deleteEnvironment);
// Custom Fields
router.post("/:projectId/custom-fields", (0, validate_1.validate)(project_schema_1.upsertCustomFieldSchema), controller.upsertCustomField);
router.put("/:projectId/custom-fields/:fieldId", (0, validate_1.validate)(project_schema_1.upsertCustomFieldSchema), controller.upsertCustomField);
router.delete("/:projectId/custom-fields/:fieldId", (0, validate_1.validate)(project_schema_1.projectIdParamSchema), controller.deleteCustomField);
// Milestones
router.get("/:projectId/milestones", (0, validate_1.validate)(project_schema_1.projectIdParamSchema), controller.getMilestones);
router.post("/:projectId/milestones", (0, validate_1.validate)(project_schema_1.createMilestoneSchema), controller.createMilestone);
router.get("/:projectId/milestones/:milestoneId", (0, validate_1.validate)(project_schema_1.milestoneParamSchema), controller.getMilestoneById);
router.patch("/:projectId/milestones/:milestoneId", (0, validate_1.validate)(project_schema_1.updateMilestoneSchema), controller.updateMilestone);
router.delete("/:projectId/milestones/:milestoneId", (0, validate_1.validate)(project_schema_1.milestoneParamSchema), controller.deleteMilestone);
router.post("/:projectId/milestones/:milestoneId/test-runs", (0, validate_1.validate)(project_schema_1.linkTestRunsSchema), controller.linkTestRuns);
router.delete("/:projectId/milestones/:milestoneId/test-runs/:testRunId", (0, validate_1.validate)(project_schema_1.milestoneParamSchema), controller.unlinkTestRun);
/* =======================
   NESTED RESOURCE ROUTERS
======================= */
router.use("/:projectId/test-cases", testCase_routes_1.default);
router.use("/:projectId/test-suites", testSuite_routes_1.default);
router.use("/:projectId/test-runs", testRun_routes_1.default);
router.use("/:projectId/bugs", bug_routes_1.default);
router.use("/:projectId/executions", execution_routes_1.default);
router.use("/:projectId/reports", report_routes_1.default);
exports.default = router;
//# sourceMappingURL=project.routes.js.map