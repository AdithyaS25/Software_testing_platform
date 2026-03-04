"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBugController = createBugController;
exports.getBugsController = getBugsController;
exports.updateBugStatusController = updateBugStatusController;
exports.assignBugController = assignBugController;
exports.addCommentController = addCommentController;
exports.deleteCommentController = deleteCommentController;
exports.getMyBugsController = getMyBugsController;
exports.getBugByIdController = getBugByIdController;
const bug_schema_1 = require("./bug.schema");
const bug_service_1 = require("./bug.service");
const notification_service_1 = require("../notification/notification.service");
const prisma_1 = require("../../prisma");
/* ── Create Bug ─────────────────────────────────────────── */
async function createBugController(req, res) {
    const projectId = req.params.projectId;
    const userId = req.user?.id;
    const parsed = bug_schema_1.createBugSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.flatten() });
    }
    const bug = await (0, bug_service_1.createBug)(projectId, parsed.data, userId);
    if (bug.assignedToId) {
        (0, notification_service_1.notifyBugAssigned)({
            assignedToId: bug.assignedToId,
            bugId: bug.bugId,
            bugTitle: bug.title,
            projectId: bug.projectId,
            internalId: bug.id,
        }).catch(console.error);
    }
    return res.status(201).json({ success: true, data: bug });
}
/* ── List Bugs ──────────────────────────────────────────── */
async function getBugsController(req, res) {
    const projectId = String(req.params.projectId);
    const q = req.query;
    const filters = {
        ...(q.status ? { status: q.status } : {}),
        ...(q.priority ? { priority: q.priority } : {}),
        ...(q.severity ? { severity: q.severity } : {}),
    };
    const bugs = await (0, bug_service_1.listBugs)(projectId, filters);
    return res.status(200).json({ success: true, data: bugs });
}
/* ── Update Status ──────────────────────────────────────── */
async function updateBugStatusController(req, res) {
    const projectId = String(req.params.projectId);
    const id = String(req.params.id);
    const userId = req.user?.id;
    const parsed = bug_schema_1.updateBugStatusSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.flatten() });
    }
    // Fetch raw bug BEFORE update — plain findFirst with no include/select
    // gives us the full scalar Bug type (status, assignedToId, resolvedById etc.)
    // Bug model has NO createdById — reporter tracking doesn't exist on this schema
    const rawBugBefore = await prisma_1.prisma.bug.findFirst({ where: { id, projectId } });
    const previousStatus = rawBugBefore?.status ?? "";
    const previousAssignedToId = rawBugBefore?.assignedToId ?? null;
    const bug = await (0, bug_service_1.updateBugStatus)(projectId, id, parsed.data, userId);
    if (!bug)
        return res.status(404).json({ success: false, message: "Bug not found" });
    // Notify on status change — notify the person making the change + assignee
    if (bug.status !== previousStatus) {
        (0, notification_service_1.notifyBugStatusChanged)({
            reporterId: userId, // person triggering the change
            assignedToId: bug.assignedToId ?? null,
            bugId: bug.bugId,
            bugTitle: bug.title,
            newStatus: bug.status,
            projectId: bug.projectId,
            internalId: bug.id,
        }).catch(console.error);
    }
    // Re-test notification: when bug moves to FIXED, notify the current assignee
    // (Bug has no createdById — assignee is the closest proxy for "who should re-test")
    // If your workflow has a separate tester field in future, swap previousAssignedToId here
    if (bug.status === "FIXED" && previousStatus !== "FIXED" && previousAssignedToId) {
        (0, notification_service_1.notifyRetestRequested)({
            testerId: previousAssignedToId, // notify whoever was assigned before fix
            bugId: bug.bugId,
            bugTitle: bug.title,
            projectId: bug.projectId,
            internalId: bug.id,
        }).catch(console.error);
    }
    return res.status(200).json({ success: true, data: bug });
}
/* ── Assign Bug ─────────────────────────────────────────── */
async function assignBugController(req, res) {
    const projectId = String(req.params.projectId);
    const id = String(req.params.id);
    const parsed = bug_schema_1.assignBugSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.flatten() });
    }
    const rawBugBefore = await prisma_1.prisma.bug.findFirst({ where: { id, projectId } });
    const previousAssignedToId = rawBugBefore?.assignedToId ?? null;
    const bug = await (0, bug_service_1.assignBug)(projectId, id, parsed.data);
    if (!bug)
        return res.status(404).json({ success: false, message: "Bug not found" });
    if (bug.assignedToId && bug.assignedToId !== previousAssignedToId) {
        (0, notification_service_1.notifyBugAssigned)({
            assignedToId: bug.assignedToId,
            bugId: bug.bugId,
            bugTitle: bug.title,
            projectId: bug.projectId,
            internalId: bug.id,
        }).catch(console.error);
    }
    return res.status(200).json({ success: true, data: bug });
}
/* ── Add Comment ────────────────────────────────────────── */
async function addCommentController(req, res) {
    const projectId = String(req.params.projectId);
    const id = String(req.params.id);
    const userId = req.user?.id;
    const parsed = bug_schema_1.createBugCommentSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Validation error", errors: parsed.error.flatten() });
    }
    const comment = await (0, bug_service_1.addBugComment)(projectId, id, parsed.data, userId);
    if (!comment)
        return res.status(404).json({ success: false, message: "Bug not found" });
    // @mention detection
    const content = parsed.data.content;
    const mentionRegex = /@([\w.+-]+@[\w.-]+\.[a-z]{2,})/gi;
    const matches = [...content.matchAll(mentionRegex)].map((m) => m[1]);
    if (matches.length > 0) {
        const [author, bug] = await Promise.all([
            prisma_1.prisma.user.findFirst({ where: { id: userId }, select: { email: true } }),
            prisma_1.prisma.bug.findFirst({ where: { id, projectId } }),
        ]);
        if (author && bug) {
            for (const emailAddr of matches) {
                // Assert emailAddr as string — regex guarantees it is never undefined
                const mentioned = await prisma_1.prisma.user.findFirst({
                    where: { email: emailAddr },
                    select: { id: true },
                });
                if (mentioned && mentioned.id !== userId) {
                    (0, notification_service_1.notifyCommentMention)({
                        mentionedUserId: mentioned.id,
                        authorEmail: author.email,
                        bugId: bug.bugId,
                        bugTitle: bug.title,
                        projectId: bug.projectId,
                        internalId: bug.id,
                    }).catch(console.error);
                }
            }
        }
    }
    return res.status(201).json({ success: true, data: comment });
}
/* ── Delete Comment ─────────────────────────────────────── */
async function deleteCommentController(req, res) {
    const id = String(req.params.id);
    const userId = req.user?.id;
    const comment = await (0, bug_service_1.deleteBugComment)(id, userId);
    if (!comment)
        return res.status(404).json({ success: false, message: "Comment not found or unauthorized" });
    return res.status(200).json({ success: true, message: "Comment deleted" });
}
/* ── My Bugs ────────────────────────────────────────────── */
async function getMyBugsController(req, res) {
    const projectId = String(req.params.projectId);
    const userId = req.user?.id;
    const q = req.query;
    const filters = {
        ...(q.status ? { status: q.status } : {}),
        ...(q.priority ? { priority: q.priority } : {}),
        ...(q.severity ? { severity: q.severity } : {}),
    };
    const bugs = await (0, bug_service_1.listMyBugs)(projectId, userId, filters);
    return res.status(200).json({ success: true, data: bugs });
}
/* ── Get Bug by ID ──────────────────────────────────────── */
async function getBugByIdController(req, res) {
    const projectId = String(req.params.projectId);
    const id = String(req.params.id);
    const bug = await (0, bug_service_1.getBugById)(projectId, id);
    if (!bug)
        return res.status(404).json({ success: false, message: "Bug not found" });
    return res.status(200).json({ success: true, data: bug });
}
//# sourceMappingURL=bug.controller.js.map