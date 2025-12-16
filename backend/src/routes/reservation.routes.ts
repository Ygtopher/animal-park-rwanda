import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createReservationSchema } from '../utils/validators';

const router = Router();
const reservationController = new ReservationController();

// All reservation routes require authentication
router.use(authenticate);

router.post(
    '/',
    validate(createReservationSchema),
    reservationController.createReservation.bind(reservationController)
);

router.get(
    '/my-bookings',
    reservationController.getMyReservations.bind(reservationController)
);

router.get('/:id', reservationController.getReservationById.bind(reservationController));

router.get(
    '/reference/:reference',
    reservationController.getReservationByReference.bind(reservationController)
);

router.put(
    '/:id/cancel',
    reservationController.cancelReservation.bind(reservationController)
);

export default router;
