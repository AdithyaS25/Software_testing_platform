import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import { getTesterPerformanceController } from './tester-performance.controller';

const router: Router = Router();

/**
 * @swagger
 * /reports/tester-performance:
 *   get:
 *     summary: Generate Tester Performance Report
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tester performance report generated successfully
 */
router.get(
  '/tester-performance',
  authenticate,
  authorize([UserRole.TESTER, UserRole.DEVELOPER, UserRole.ADMIN]),
  getTesterPerformanceController
);

export default router;
