"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const async_handler_1 = require("../../utils/async-handler");
const prisma_1 = require("../../prisma");
const router = (0, express_1.Router)();
router.use((0, async_handler_1.asHandler)(auth_middleware_1.authenticate));
// ─── GET /notifications ───────────────────────────────────────────────────────
router.get("/", (0, async_handler_1.asHandler)(async (req, res) => {
    const { id: userId } = req.user;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === "true";
    const where = { userId, ...(unreadOnly ? { isRead: false } : {}) };
    const [notifications, total, unreadCount] = await Promise.all([
        prisma_1.prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
        prisma_1.prisma.notification.count({ where }),
        prisma_1.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    res.json({ notifications, total, unreadCount, page, limit });
}));
// ─── GET /notifications/unread-count ─────────────────────────────────────────
router.get("/unread-count", (0, async_handler_1.asHandler)(async (req, res) => {
    const { id: userId } = req.user;
    const count = await prisma_1.prisma.notification.count({ where: { userId, isRead: false } });
    res.json({ count });
}));
// ─── PATCH /notifications/read-all ───────────────────────────────────────────
router.patch("/read-all", (0, async_handler_1.asHandler)(async (req, res) => {
    const { id: userId } = req.user;
    await prisma_1.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    res.json({ message: "All notifications marked as read" });
}));
// ─── GET /notifications/preferences ──────────────────────────────────────────
// NOTE: static routes must come BEFORE /:id to avoid param conflict
router.get("/preferences", (0, async_handler_1.asHandler)(async (req, res) => {
    const { id: userId } = req.user;
    let pref = await prisma_1.prisma.notificationPreference.findUnique({ where: { userId } });
    if (!pref)
        pref = await prisma_1.prisma.notificationPreference.create({ data: { userId } });
    res.json(pref);
}));
// ─── PUT /notifications/preferences ──────────────────────────────────────────
router.put("/preferences", (0, async_handler_1.asHandler)(async (req, res) => {
    const { id: userId } = req.user;
    const allowed = [
        "emailBugAssigned", "emailBugStatusChanged", "emailTestAssigned",
        "emailCommentMention", "emailRetestRequested",
        "inAppBugAssigned", "inAppBugStatusChanged", "inAppTestAssigned",
        "inAppCommentMention", "inAppRetestRequested",
    ];
    const data = {};
    for (const key of allowed) {
        if (typeof req.body[key] === "boolean")
            data[key] = req.body[key];
    }
    const pref = await prisma_1.prisma.notificationPreference.upsert({
        where: { userId },
        create: { userId, ...data },
        update: data,
    });
    res.json(pref);
}));
// ─── PATCH /notifications/:id/read ───────────────────────────────────────────
router.patch("/:id/read", (0, async_handler_1.asHandler)(async (req, res) => {
    const { id: userId } = req.user;
    // String() cast satisfies exactOptionalPropertyTypes — req.params.id is always string here
    const id = String(req.params.id);
    const notif = await prisma_1.prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId)
        return res.status(404).json({ message: "Not found" });
    const updated = await prisma_1.prisma.notification.update({ where: { id }, data: { isRead: true } });
    res.json(updated);
}));
// ─── PATCH /notifications/:id/unread ─────────────────────────────────────────
router.patch("/:id/unread", (0, async_handler_1.asHandler)(async (req, res) => {
    const { id: userId } = req.user;
    const id = String(req.params.id);
    const notif = await prisma_1.prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId)
        return res.status(404).json({ message: "Not found" });
    const updated = await prisma_1.prisma.notification.update({ where: { id }, data: { isRead: false } });
    res.json(updated);
}));
// ─── DELETE /notifications/:id ────────────────────────────────────────────────
router.delete("/:id", (0, async_handler_1.asHandler)(async (req, res) => {
    const { id: userId } = req.user;
    const id = String(req.params.id);
    const notif = await prisma_1.prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId)
        return res.status(404).json({ message: "Not found" });
    await prisma_1.prisma.notification.delete({ where: { id } });
    res.json({ message: "Deleted" });
}));
// ─── DELETE /notifications (clear all) ───────────────────────────────────────
router.delete("/", (0, async_handler_1.asHandler)(async (req, res) => {
    const { id: userId } = req.user;
    await prisma_1.prisma.notification.deleteMany({ where: { userId } });
    res.json({ message: "All notifications cleared" });
}));
exports.default = router;
//# sourceMappingURL=notification.routes.js.map