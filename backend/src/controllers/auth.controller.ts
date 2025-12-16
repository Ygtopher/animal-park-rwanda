import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, firstName, lastName, phone } = req.body;

            const result = await authService.register({
                email,
                password,
                firstName,
                lastName,
                phone,
            });

            res.status(201).json({
                success: true,
                data: result,
                message: 'User registered successfully',
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            const result = await authService.login(email, password);

            res.status(200).json({
                success: true,
                data: result,
                message: 'Login successful',
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
                return;
            }

            const user = await authService.getCurrentUser(req.user.userId);

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'User not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async changePassword(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
                return;
            }

            const { currentPassword, newPassword } = req.body;

            await authService.changePassword(req.user.userId, currentPassword, newPassword);

            res.status(200).json({
                success: true,
                message: 'Password changed successfully',
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }
}
