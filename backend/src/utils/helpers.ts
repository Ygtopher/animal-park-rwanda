import { format, parseISO } from 'date-fns';

export const generateBookingReference = (): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `APR-${timestamp}-${random}`;
};

export const formatCurrency = (amount: number, currency: string = 'RWF'): string => {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export const formatDate = (date: Date | string, formatStr: string = 'PPP'): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
};

export const calculateRefundAmount = (
    totalAmount: number,
    visitDate: Date,
    cancellationDate: Date = new Date()
): number => {
    const daysUntilVisit = Math.ceil(
        (visitDate.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilVisit >= 7) {
        return totalAmount * 0.9; // 90% refund
    } else if (daysUntilVisit >= 3) {
        return totalAmount * 0.5; // 50% refund
    } else {
        return 0; // No refund
    }
};

export const isValidPhoneNumber = (phone: string): boolean => {
    return /^\+250\d{9}$/.test(phone);
};

export const sanitizeString = (str: string): string => {
    return str.trim().replace(/[<>]/g, '');
};
