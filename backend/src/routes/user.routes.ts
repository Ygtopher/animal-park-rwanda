import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.post('/', UserController.createUser);
router.get('/', UserController.getAllUsers);
router.put('/:id/role', UserController.updateUserRole);
router.delete('/:id', UserController.deleteUser);

export default router;
