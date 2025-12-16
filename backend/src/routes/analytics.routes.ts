import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

// Ranger analytics - only accessible by rangers
router.get(
    '/ranger',
    authenticate,
    authorize('RANGER'),
    analyticsController.getRangerAnalytics.bind(analyticsController)
);

// Admin analytics - only accessible by admins
router.get(
    '/admin',
    authenticate,
    authorize('ADMIN'),
    analyticsController.getAdminAnalytics.bind(analyticsController)
);

export default router;
