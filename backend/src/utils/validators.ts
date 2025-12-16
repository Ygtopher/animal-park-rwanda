import { z } from 'zod';

// Auth validators
export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        phone: z.string().regex(/^\+250\d{9}$/, 'Invalid Rwanda phone number format'),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

// Reservation validators
export const createReservationSchema = z.object({
    body: z.object({
        parkId: z.string().uuid('Invalid park ID'),
        visitDate: z.string().datetime('Invalid date format'),
        numberOfVisitors: z.number().int().min(1, 'At least 1 visitor required').max(50, 'Maximum 50 visitors per booking'),
        visitorType: z.enum(['RWANDAN_ADULT', 'RWANDAN_CHILD', 'EAC_ADULT', 'EAC_CHILD', 'FOREIGN_ADULT', 'FOREIGN_CHILD']).optional(),
        specialRequests: z.string().optional(),
    }),
});

// Park validators
export const createParkSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Park name is required'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        location: z.string().min(1, 'Location is required'),
        province: z.enum(['KIGALI', 'NORTHERN', 'SOUTHERN', 'EASTERN', 'WESTERN']),
        district: z.string().min(1, 'District is required'),
        capacity: z.number().int().min(1, 'Capacity must be at least 1'),
        openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
        basePrice: z.number().min(0, 'Price must be non-negative'),
        amenities: z.array(z.string()).optional(),
    }),
});

// Payment validators
export const initiatePaymentSchema = z.object({
    body: z.object({
        reservationId: z.string().uuid('Invalid reservation ID'),
        method: z.enum(['MOBILE_MONEY_MTN', 'MOBILE_MONEY_AIRTEL', 'CARD', 'BANK_TRANSFER']),
        phoneNumber: z.string().optional(),
    }),
});

// Review validators
export const createReviewSchema = z.object({
    body: z.object({
        parkId: z.string().uuid('Invalid park ID'),
        rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
        comment: z.string().min(10, 'Comment must be at least 10 characters'),
    }),
});

// Incident validators
export const createIncidentSchema = z.object({
    body: z.object({
        parkId: z.string().uuid('Invalid park ID'),
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    }),
});
