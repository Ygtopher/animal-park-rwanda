import { Router } from 'express';
import { ParkRangerController } from '../controllers/parkRanger.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const parkRangerController = new ParkRangerController();

// All routes require authentication
router.use(authenticate);

// Assign ranger to park (Admin only)
router.post(
    '/assign',
    authorize('ADMIN'),
    parkRangerController.assignRangerToPark.bind(parkRangerController)
);

// Get ranger assignment
router.get(
    '/:userId/assignment',
    parkRangerController.getRangerAssignment.bind(parkRangerController)
);

export default router;
