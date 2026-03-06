import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { asHandler } from '../../utils/async-handler';
import { AuthenticatedRequest } from '../../types/auth-request';
import { prisma } from '../../prisma';

const router: Router = Router();

router.use(asHandler(authenticate));

// ─── GET /notifications ───────────────────────────────────────────────────────
router.get(
  '/',
  asHandler(async (req: Request, res: Response) => {
    const { id: userId } = (req as AuthenticatedRequest).user!;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === 'true';

    const where = { userId, ...(unreadOnly ? { isRead: false } : {}) };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    res.json({ notifications, total, unreadCount, page, limit });
  })
);

// ─── GET /notifications/unread-count ─────────────────────────────────────────
router.get(
  '/unread-count',
  asHandler(async (req: Request, res: Response) => {
    const { id: userId } = (req as AuthenticatedRequest).user!;
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    res.json({ count });
  })
);

// ─── PATCH /notifications/read-all ───────────────────────────────────────────
router.patch(
  '/read-all',
  asHandler(async (req: Request, res: Response) => {
    const { id: userId } = (req as AuthenticatedRequest).user!;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read' });
  })
);

// ─── GET /notifications/preferences ──────────────────────────────────────────
// NOTE: static routes must come BEFORE /:id to avoid param conflict
router.get(
  '/preferences',
  asHandler(async (req: Request, res: Response) => {
    const { id: userId } = (req as AuthenticatedRequest).user!;
    let pref = await prisma.notificationPreference.findUnique({
      where: { userId },
    });
    if (!pref)
      pref = await prisma.notificationPreference.create({ data: { userId } });
    res.json(pref);
  })
);

// ─── PUT /notifications/preferences ──────────────────────────────────────────
router.put(
  '/preferences',
  asHandler(async (req: Request, res: Response) => {
    const { id: userId } = (req as AuthenticatedRequest).user!;
    const allowed = [
      'emailBugAssigned',
      'emailBugStatusChanged',
      'emailTestAssigned',
      'emailCommentMention',
      'emailRetestRequested',
      'inAppBugAssigned',
      'inAppBugStatusChanged',
      'inAppTestAssigned',
      'inAppCommentMention',
      'inAppRetestRequested',
    ];
    const data: Record<string, boolean> = {};
    for (const key of allowed) {
      if (typeof req.body[key] === 'boolean') data[key] = req.body[key];
    }
    const pref = await prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    res.json(pref);
  })
);

// ─── PATCH /notifications/:id/read ───────────────────────────────────────────
router.patch(
  '/:id/read',
  asHandler(async (req: Request, res: Response) => {
    const { id: userId } = (req as AuthenticatedRequest).user!;
    // String() cast satisfies exactOptionalPropertyTypes — req.params.id is always string here
    const id = String(req.params.id);
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId)
      return res.status(404).json({ message: 'Not found' });
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json(updated);
  })
);

// ─── PATCH /notifications/:id/unread ─────────────────────────────────────────
router.patch(
  '/:id/unread',
  asHandler(async (req: Request, res: Response) => {
    const { id: userId } = (req as AuthenticatedRequest).user!;
    const id = String(req.params.id);
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId)
      return res.status(404).json({ message: 'Not found' });
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: false },
    });
    res.json(updated);
  })
);

// ─── DELETE /notifications/:id ────────────────────────────────────────────────
router.delete(
  '/:id',
  asHandler(async (req: Request, res: Response) => {
    const { id: userId } = (req as AuthenticatedRequest).user!;
    const id = String(req.params.id);
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId)
      return res.status(404).json({ message: 'Not found' });
    await prisma.notification.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  })
);

// ─── DELETE /notifications (clear all) ───────────────────────────────────────
router.delete(
  '/',
  asHandler(async (req: Request, res: Response) => {
    const { id: userId } = (req as AuthenticatedRequest).user!;
    await prisma.notification.deleteMany({ where: { userId } });
    res.json({ message: 'All notifications cleared' });
  })
);

export default router;
