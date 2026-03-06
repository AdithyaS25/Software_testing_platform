import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import { getDashboardController } from './dashboard.controller';

const router: Router = Router();

/**
 * @swagger
 * /reports/dashboard:
 *   get:
 *     summary: Get Dashboard Summary Widgets
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/dashboard',
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER, UserRole.ADMIN]),
  getDashboardController
);

export default router;
