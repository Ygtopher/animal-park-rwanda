import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { AuthRequest } from '../middleware/auth.middleware';

const paymentService = new PaymentService();

export class PaymentController {
    async initiatePayment(req: AuthRequest, res: Response): Promise<void> {
        try {
            const result = await paymentService.initiatePayment(req.body);

            res.status(201).json({
                success: true,
                data: result,
                message: 'Payment initiated successfully',
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async verifyPayment(req: Request, res: Response): Promise<void> {
        try {
            const { transactionId } = req.params;

            const payment = await paymentService.verifyPayment(transactionId);

            res.status(200).json({
                success: true,
                data: payment,
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async simulatePayment(req: Request, res: Response): Promise<void> {
        try {
            const { transactionId } = req.params;

            const result = await paymentService.simulatePayment(transactionId);

            res.status(200).json({
                success: result.success,
                data: result.payment,
                message: result.message,
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async handleWebhook(req: Request, res: Response): Promise<void> {
        try {
            await paymentService.handlePaymentWebhook(req.body);

            res.status(200).json({
                success: true,
                message: 'Webhook processed successfully',
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }
}
