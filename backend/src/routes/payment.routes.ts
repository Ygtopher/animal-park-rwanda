import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { initiatePaymentSchema } from '../utils/validators';
import { paymentLimiter } from '../middleware/rate-limit.middleware';

const router = Router();
const paymentController = new PaymentController();

router.post(
    '/initiate',
    authenticate,
    paymentLimiter,
    validate(initiatePaymentSchema),
    paymentController.initiatePayment.bind(paymentController)
);

router.get(
    '/:transactionId/status',
    authenticate,
    paymentController.verifyPayment.bind(paymentController)
);

router.post(
    '/:transactionId/simulate',
    authenticate,
    paymentController.simulatePayment.bind(paymentController)
);

router.post('/webhook', paymentController.handleWebhook.bind(paymentController));

export default router;
