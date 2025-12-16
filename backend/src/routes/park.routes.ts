import { Router } from 'express';
import { ParkController } from '../controllers/park.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createParkSchema } from '../utils/validators';

const router = Router();
const parkController = new ParkController();

// Public routes
router.get('/', parkController.getAllParks.bind(parkController));
router.get('/:id', parkController.getParkById.bind(parkController));
router.get('/:id/availability', parkController.checkAvailability.bind(parkController));
router.get('/:id/animals', parkController.getAnimals.bind(parkController));

// Admin only routes
router.post(
    '/',
    authenticate,
    authorize('ADMIN'),
    validate(createParkSchema),
    parkController.createPark.bind(parkController)
);

router.put(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    parkController.updatePark.bind(parkController)
);

router.delete(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    parkController.deletePark.bind(parkController)
);

// Animal management (Admin and Ranger)
router.post(
    '/:id/animals',
    authenticate,
    authorize('ADMIN', 'RANGER'),
    parkController.addAnimal.bind(parkController)
);

router.put(
    '/animals/:animalId',
    authenticate,
    authorize('ADMIN', 'RANGER'),
    parkController.updateAnimal.bind(parkController)
);

router.delete(
    '/animals/:animalId',
    authenticate,
    authorize('ADMIN', 'RANGER'),
    parkController.deleteAnimal.bind(parkController)
);

export default router;
