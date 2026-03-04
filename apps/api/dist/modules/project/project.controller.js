"use strict";
// File: apps/api/src/modules/project/project.controller.ts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = createProject;
exports.getAllProjects = getAllProjects;
exports.getProjectById = getProjectById;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.getMembers = getMembers;
exports.addMembers = addMembers;
exports.removeMember = removeMember;
exports.upsertEnvironment = upsertEnvironment;
exports.deleteEnvironment = deleteEnvironment;
exports.upsertCustomField = upsertCustomField;
exports.deleteCustomField = deleteCustomField;
exports.createMilestone = createMilestone;
exports.getMilestones = getMilestones;
exports.getMilestoneById = getMilestoneById;
exports.updateMilestone = updateMilestone;
exports.deleteMilestone = deleteMilestone;
exports.linkTestRuns = linkTestRuns;
exports.unlinkTestRun = unlinkTestRun;
const prisma_1 = require("../../prisma");
const projectService = __importStar(require("./project.service"));
// ─────────────────────────────────────────────────────────────
// Helper: safely extract route params (strict mode safe)
// ─────────────────────────────────────────────────────────────
function getParam(value, name) {
    if (!value || Array.isArray(value)) {
        throw new Error(`Invalid or missing route parameter: ${name}`);
    }
    return value;
}
// ─── Projects ────────────────────────────────────────────────
async function createProject(req, res, next) {
    try {
        const project = await projectService.createProject(req.user.id, req.body);
        res.status(201).json({ success: true, data: project });
    }
    catch (err) {
        next(err);
    }
}
async function getAllProjects(req, res, next) {
    try {
        const projects = await projectService.getAllProjects(req.user.id);
        res.json({ success: true, data: projects });
    }
    catch (err) {
        next(err);
    }
}
async function getProjectById(req, res, next) {
    try {
        const project = await projectService.getProjectById(getParam(req.params.projectId, 'projectId'), req.user.id);
        res.json({ success: true, data: project });
    }
    catch (err) {
        next(err);
    }
}
async function updateProject(req, res, next) {
    try {
        const project = await projectService.updateProject(getParam(req.params.projectId, 'projectId'), req.user.id, req.body);
        res.json({ success: true, data: project });
    }
    catch (err) {
        next(err);
    }
}
// AFTER
async function deleteProject(req, res, next) {
    try {
        const projectId = req.params.projectId;
        if (!projectId) {
            return res.status(400).json({ success: false, message: 'Missing projectId' });
        }
        const result = await projectService.deleteProject(projectId, req.user.id);
        res.json({ success: true, data: result });
    }
    catch (err) {
        const msg = err?.message ?? '';
        if (msg.toLowerCase().includes('forbidden') || msg.toLowerCase().includes('not owner') || msg.toLowerCase().includes('permission')) {
            return res.status(403).json({ success: false, message: 'You do not have permission to delete this project' });
        }
        next(err);
    }
}
async function getMembers(req, res, next) {
    try {
        const projectId = req.params.projectId;
        const members = await prisma_1.prisma.projectMember.findMany({
            where: { projectId },
            include: {
                user: { select: { id: true, email: true, role: true } },
            },
        });
        // Also include the owner in case they're not in ProjectMember table
        const project = await prisma_1.prisma.project.findFirst({
            where: { id: projectId },
            select: { owner: { select: { id: true, email: true, role: true } } },
        });
        // Merge owner + members, deduplicate by id
        const allUsers = [
            ...(project?.owner ? [{ user: project.owner }] : []),
            ...members,
        ];
        const seen = new Set();
        const unique = allUsers.filter(m => {
            if (seen.has(m.user.id))
                return false;
            seen.add(m.user.id);
            return true;
        });
        res.json({ success: true, data: unique });
    }
    catch (err) {
        next(err);
    }
}
// ─── Members ─────────────────────────────────────────────────
async function addMembers(req, res, next) {
    try {
        const project = await projectService.addMembers(getParam(req.params.projectId, 'projectId'), req.user.id, req.body);
        res.status(201).json({ success: true, data: project });
    }
    catch (err) {
        next(err);
    }
}
async function removeMember(req, res, next) {
    try {
        const result = await projectService.removeMember(getParam(req.params.projectId, 'projectId'), getParam(req.params.userId, 'userId'), req.user.id);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
// ─── Environments ─────────────────────────────────────────────
async function upsertEnvironment(req, res, next) {
    try {
        const env = await projectService.upsertEnvironment(getParam(req.params.projectId, 'projectId'), req.user.id, req.params.envId ? getParam(req.params.envId, 'envId') : undefined, req.body);
        res.status(201).json({ success: true, data: env });
    }
    catch (err) {
        next(err);
    }
}
async function deleteEnvironment(req, res, next) {
    try {
        await projectService.deleteEnvironment(getParam(req.params.projectId, 'projectId'), getParam(req.params.envId, 'envId'), req.user.id);
        res.json({ success: true, message: 'Environment deleted' });
    }
    catch (err) {
        next(err);
    }
}
// ─── Custom Fields ────────────────────────────────────────────
async function upsertCustomField(req, res, next) {
    try {
        const field = await projectService.upsertCustomField(getParam(req.params.projectId, 'projectId'), req.user.id, req.params.fieldId ? getParam(req.params.fieldId, 'fieldId') : undefined, req.body);
        res.status(201).json({ success: true, data: field });
    }
    catch (err) {
        next(err);
    }
}
async function deleteCustomField(req, res, next) {
    try {
        await projectService.deleteCustomField(getParam(req.params.projectId, 'projectId'), getParam(req.params.fieldId, 'fieldId'), req.user.id);
        res.json({ success: true, message: 'Custom field deleted' });
    }
    catch (err) {
        next(err);
    }
}
// ─── Milestones ───────────────────────────────────────────────
async function createMilestone(req, res, next) {
    try {
        const milestone = await projectService.createMilestone(getParam(req.params.projectId, 'projectId'), req.user.id, req.body);
        res.status(201).json({ success: true, data: milestone });
    }
    catch (err) {
        next(err);
    }
}
async function getMilestones(req, res, next) {
    try {
        const milestones = await projectService.getMilestones(getParam(req.params.projectId, 'projectId'), req.user.id);
        res.json({ success: true, data: milestones });
    }
    catch (err) {
        next(err);
    }
}
async function getMilestoneById(req, res, next) {
    try {
        const milestone = await projectService.getMilestoneById(getParam(req.params.projectId, 'projectId'), getParam(req.params.milestoneId, 'milestoneId'), req.user.id);
        res.json({ success: true, data: milestone });
    }
    catch (err) {
        next(err);
    }
}
async function updateMilestone(req, res, next) {
    try {
        const milestone = await projectService.updateMilestone(getParam(req.params.projectId, 'projectId'), getParam(req.params.milestoneId, 'milestoneId'), req.user.id, req.body);
        res.json({ success: true, data: milestone });
    }
    catch (err) {
        next(err);
    }
}
async function deleteMilestone(req, res, next) {
    try {
        const result = await projectService.deleteMilestone(getParam(req.params.projectId, 'projectId'), getParam(req.params.milestoneId, 'milestoneId'), req.user.id);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function linkTestRuns(req, res, next) {
    try {
        const milestone = await projectService.linkTestRunsToMilestone(getParam(req.params.projectId, 'projectId'), getParam(req.params.milestoneId, 'milestoneId'), req.user.id, req.body);
        res.json({ success: true, data: milestone });
    }
    catch (err) {
        next(err);
    }
}
async function unlinkTestRun(req, res, next) {
    try {
        const milestone = await projectService.unlinkTestRunFromMilestone(getParam(req.params.projectId, 'projectId'), getParam(req.params.milestoneId, 'milestoneId'), getParam(req.params.testRunId, 'testRunId'), req.user.id);
        res.json({ success: true, data: milestone });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=project.controller.js.map