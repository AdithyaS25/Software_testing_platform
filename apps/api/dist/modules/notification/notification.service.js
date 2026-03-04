"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.notifyBugAssigned = notifyBugAssigned;
exports.notifyBugStatusChanged = notifyBugStatusChanged;
exports.notifyTestRunAssigned = notifyTestRunAssigned;
exports.notifyCommentMention = notifyCommentMention;
exports.notifyRetestRequested = notifyRetestRequested;
const prisma_1 = require("../../prisma");
const email_utils_1 = require("../../utils/email.utils");
// ─── Preference field map ─────────────────────────────────────────────────────
const PREF_MAP = {
    BUG_ASSIGNED: { email: "emailBugAssigned", inApp: "inAppBugAssigned" },
    BUG_STATUS_CHANGED: { email: "emailBugStatusChanged", inApp: "inAppBugStatusChanged" },
    TEST_RUN_ASSIGNED: { email: "emailTestAssigned", inApp: "inAppTestAssigned" },
    COMMENT_MENTION: { email: "emailCommentMention", inApp: "inAppCommentMention" },
    RETEST_REQUESTED: { email: "emailRetestRequested", inApp: "inAppRetestRequested" },
};
// ─── Core ─────────────────────────────────────────────────────────────────────
async function createNotification(payload) {
    const { userId, type, title, message, link } = payload;
    let pref = await prisma_1.prisma.notificationPreference.findUnique({ where: { userId } });
    if (!pref)
        pref = await prisma_1.prisma.notificationPreference.create({ data: { userId } });
    const prefKeys = PREF_MAP[type];
    if (!prefKeys)
        return;
    const prefRecord = pref;
    // In-app
    if (prefRecord[prefKeys.inApp] !== false) {
        await prisma_1.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                // link is optional in schema (String?) so pass null when undefined
                ...(link !== undefined ? { link } : { link: null }),
            },
        });
    }
    // Email
    if (prefRecord[prefKeys.email] !== false) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
        if (user?.email) {
            (0, email_utils_1.sendEmail)({
                to: user.email,
                subject: title,
                html: buildEmailHtml(title, message, link),
            }).catch((err) => console.error("[Email] Failed to send:", err));
        }
    }
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
async function notifyBugAssigned(opts) {
    await createNotification({
        userId: opts.assignedToId,
        type: "BUG_ASSIGNED",
        title: `New bug assigned: ${opts.bugId}`,
        message: `You have been assigned bug "${opts.bugTitle}"`,
        link: `/projects/${opts.projectId}/bugs/${opts.internalId}`,
    });
}
async function notifyBugStatusChanged(opts) {
    const targets = new Set();
    targets.add(opts.reporterId);
    if (opts.assignedToId)
        targets.add(opts.assignedToId);
    for (const userId of targets) {
        await createNotification({
            userId,
            type: "BUG_STATUS_CHANGED",
            title: `Bug ${opts.bugId} status changed`,
            message: `"${opts.bugTitle}" is now ${opts.newStatus.replace(/_/g, " ")}`,
            link: `/projects/${opts.projectId}/bugs/${opts.internalId}`,
        });
    }
}
async function notifyTestRunAssigned(opts) {
    await createNotification({
        userId: opts.assignedToId,
        type: "TEST_RUN_ASSIGNED",
        title: `Test run assigned: ${opts.testRunName}`,
        message: `You have been assigned to test run "${opts.testRunName}"`,
        link: `/projects/${opts.projectId}/test-runs`,
    });
}
async function notifyCommentMention(opts) {
    await createNotification({
        userId: opts.mentionedUserId,
        type: "COMMENT_MENTION",
        title: `You were mentioned in ${opts.bugId}`,
        message: `${opts.authorEmail} mentioned you in "${opts.bugTitle}"`,
        link: `/projects/${opts.projectId}/bugs/${opts.internalId}`,
    });
}
async function notifyRetestRequested(opts) {
    await createNotification({
        userId: opts.testerId,
        type: "RETEST_REQUESTED",
        title: `Re-test requested: ${opts.bugId}`,
        message: `A re-test has been requested for "${opts.bugTitle}"`,
        link: `/projects/${opts.projectId}/bugs/${opts.internalId}`,
    });
}
// ─── Email HTML ───────────────────────────────────────────────────────────────
function buildEmailHtml(title, message, link) {
    const btn = link
        ? `<p style="margin-top:24px">
        <a href="${process.env.FRONTEND_URL}${link}"
           style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">
          View in TestTrack Pro
        </a>
       </p>`
        : "";
    return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px">
      <h2 style="color:#1f2937;margin-bottom:8px">${title}</h2>
      <p style="color:#4b5563;font-size:15px">${message}</p>
      ${btn}
      <hr style="margin-top:32px;border:none;border-top:1px solid #e5e7eb"/>
      <p style="color:#9ca3af;font-size:12px">TestTrack Pro — manage preferences in your settings.</p>
    </div>`;
}
//# sourceMappingURL=notification.service.js.map