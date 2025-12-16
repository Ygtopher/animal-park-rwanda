import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AuthRequest } from '../middleware/auth.middleware';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
    async getRangerAnalytics(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
                return;
            }

            const analytics = await analyticsService.getRangerAnalytics(userId);

            res.status(200).json({
                success: true,
                data: analytics,
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async getAdminAnalytics(req: AuthRequest, res: Response): Promise<void> {
        try {
            const analytics = await analyticsService.getAdminAnalytics();

            res.status(200).json({
                success: true,
                data: analytics,
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }
}
