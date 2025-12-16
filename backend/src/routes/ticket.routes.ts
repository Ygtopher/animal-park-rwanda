import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const ticketController = new TicketController();

// All ticket routes require authentication
router.use(authenticate);

// POST routes (specific paths) must come before parameterized GET routes
router.post(
    '/scan',
    authorize('RANGER', 'ADMIN'),
    ticketController.scanTicket.bind(ticketController)
);

// GET routes with parameters come last
router.get(
    '/:reservationId/download',
    ticketController.downloadTicket.bind(ticketController)
);

router.get(
    '/:reservationId',
    ticketController.getTicket.bind(ticketController)
);

export default router;
