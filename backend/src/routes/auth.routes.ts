import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { registerSchema, loginSchema } from '../utils/validators';
import { authLimiter } from '../middleware/rate-limit.middleware';

const router = Router();
const authController = new AuthController();

router.post(
    '/register',
    authLimiter,
    validate(registerSchema),
    authController.register.bind(authController)
);

router.post(
    '/login',
    authLimiter,
    validate(loginSchema),
    authController.login.bind(authController)
);

router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

router.post('/change-password', authenticate, authController.changePassword.bind(authController));

export default router;
