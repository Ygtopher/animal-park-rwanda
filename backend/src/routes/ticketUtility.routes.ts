import { Router } from 'express';
import { TicketUtilityController } from '../controllers/ticketUtility.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const ticketUtilityController = new TicketUtilityController();

// Admin-only utility route to generate missing tickets
router.post(
    '/generate-missing',
    authenticate,
    authorize('ADMIN'),
    ticketUtilityController.generateMissingTickets.bind(ticketUtilityController)
);

export default router;
