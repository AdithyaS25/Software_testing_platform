import { NotificationType } from '@prisma/client';
import { prisma } from '../../prisma';
import { sendEmail } from '../../utils/email.utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

// ─── Preference field map ─────────────────────────────────────────────────────

const PREF_MAP: Record<NotificationType, { email: string; inApp: string }> = {
  BUG_ASSIGNED: { email: 'emailBugAssigned', inApp: 'inAppBugAssigned' },
  BUG_STATUS_CHANGED: {
    email: 'emailBugStatusChanged',
    inApp: 'inAppBugStatusChanged',
  },
  TEST_RUN_ASSIGNED: { email: 'emailTestAssigned', inApp: 'inAppTestAssigned' },
  COMMENT_MENTION: {
    email: 'emailCommentMention',
    inApp: 'inAppCommentMention',
  },
  RETEST_REQUESTED: {
    email: 'emailRetestRequested',
    inApp: 'inAppRetestRequested',
  },
};

// ─── Core ─────────────────────────────────────────────────────────────────────

export async function createNotification(payload: CreateNotificationPayload) {
  const { userId, type, title, message, link } = payload;

  let pref = await prisma.notificationPreference.findUnique({
    where: { userId },
  });
  if (!pref)
    pref = await prisma.notificationPreference.create({ data: { userId } });

  const prefKeys = PREF_MAP[type];
  if (!prefKeys) return;

  const prefRecord = pref as unknown as Record<string, unknown>;

  // In-app
  if (prefRecord[prefKeys.inApp] !== false) {
    await prisma.notification.create({
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (user?.email) {
      sendEmail({
        to: user.email,
        subject: title,
        html: buildEmailHtml(title, message, link),
      }).catch((err: unknown) => console.error('[Email] Failed to send:', err));
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function notifyBugAssigned(opts: {
  assignedToId: string;
  bugId: string;
  bugTitle: string;
  projectId: string;
  internalId: string;
}) {
  await createNotification({
    userId: opts.assignedToId,
    type: 'BUG_ASSIGNED',
    title: `New bug assigned: ${opts.bugId}`,
    message: `You have been assigned bug "${opts.bugTitle}"`,
    link: `/projects/${opts.projectId}/bugs/${opts.internalId}`,
  });
}

export async function notifyBugStatusChanged(opts: {
  reporterId: string;
  assignedToId: string | null;
  bugId: string;
  bugTitle: string;
  newStatus: string;
  projectId: string;
  internalId: string;
}) {
  const targets = new Set<string>();
  targets.add(opts.reporterId);
  if (opts.assignedToId) targets.add(opts.assignedToId);
  for (const userId of targets) {
    await createNotification({
      userId,
      type: 'BUG_STATUS_CHANGED',
      title: `Bug ${opts.bugId} status changed`,
      message: `"${opts.bugTitle}" is now ${opts.newStatus.replace(/_/g, ' ')}`,
      link: `/projects/${opts.projectId}/bugs/${opts.internalId}`,
    });
  }
}

export async function notifyTestRunAssigned(opts: {
  assignedToId: string;
  testRunName: string;
  projectId: string;
  testRunId: string;
}) {
  await createNotification({
    userId: opts.assignedToId,
    type: 'TEST_RUN_ASSIGNED',
    title: `Test run assigned: ${opts.testRunName}`,
    message: `You have been assigned to test run "${opts.testRunName}"`,
    link: `/projects/${opts.projectId}/test-runs`,
  });
}

export async function notifyCommentMention(opts: {
  mentionedUserId: string;
  authorEmail: string;
  bugId: string;
  bugTitle: string;
  projectId: string;
  internalId: string;
}) {
  await createNotification({
    userId: opts.mentionedUserId,
    type: 'COMMENT_MENTION',
    title: `You were mentioned in ${opts.bugId}`,
    message: `${opts.authorEmail} mentioned you in "${opts.bugTitle}"`,
    link: `/projects/${opts.projectId}/bugs/${opts.internalId}`,
  });
}

export async function notifyRetestRequested(opts: {
  testerId: string;
  bugId: string;
  bugTitle: string;
  projectId: string;
  internalId: string;
}) {
  await createNotification({
    userId: opts.testerId,
    type: 'RETEST_REQUESTED',
    title: `Re-test requested: ${opts.bugId}`,
    message: `A re-test has been requested for "${opts.bugTitle}"`,
    link: `/projects/${opts.projectId}/bugs/${opts.internalId}`,
  });
}

// ─── Email HTML ───────────────────────────────────────────────────────────────

function buildEmailHtml(title: string, message: string, link?: string): string {
  const btn = link
    ? `<p style="margin-top:24px">
        <a href="${process.env.FRONTEND_URL}${link}"
           style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">
          View in TestTrack Pro
        </a>
       </p>`
    : '';
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px">
      <h2 style="color:#1f2937;margin-bottom:8px">${title}</h2>
      <p style="color:#4b5563;font-size:15px">${message}</p>
      ${btn}
      <hr style="margin-top:32px;border:none;border-top:1px solid #e5e7eb"/>
      <p style="color:#9ca3af;font-size:12px">TestTrack Pro — manage preferences in your settings.</p>
    </div>`;
}
