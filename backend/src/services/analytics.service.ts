import prisma from '../config/database';
import { ReservationStatus } from '@prisma/client';

export class AnalyticsService {
    // Ranger Analytics - Park-specific statistics
    async getRangerAnalytics(rangerId: string) {
        // Get ranger's assigned park
        const ranger = await prisma.parkRanger.findUnique({
            where: { userId: rangerId },
            include: { park: true },
        });

        if (!ranger) {
            throw new Error('Ranger assignment not found');
        }

        const parkId = ranger.parkId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Total reservations for this park
        const totalReservations = await prisma.reservation.count({
            where: { parkId },
        });

        // Today's visitors
        const todayVisitors = await prisma.reservation.aggregate({
            where: {
                parkId,
                visitDate: {
                    gte: today,
                    lt: tomorrow,
                },
                status: ReservationStatus.CONFIRMED,
            },
            _sum: {
                numberOfVisitors: true,
            },
        });

        // Today's reservations count
        const todayReservationsCount = await prisma.reservation.count({
            where: {
                parkId,
                visitDate: {
                    gte: today,
                    lt: tomorrow,
                },
                status: ReservationStatus.CONFIRMED,
            },
        });

        // Pending check-ins (confirmed but not scanned)
        const pendingCheckIns = await prisma.ticket.count({
            where: {
                reservation: {
                    parkId,
                    visitDate: {
                        gte: today,
                        lt: tomorrow,
                    },
                    status: ReservationStatus.CONFIRMED,
                },
                scanned: false,
            },
        });

        // Scanned tickets today (tickets that were scanned today, regardless of visit date)
        const scannedTickets = await prisma.ticket.count({
            where: {
                reservation: {
                    parkId,
                },
                scanned: true,
                scannedAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        // Get park capacity
        const park = await prisma.park.findUnique({
            where: { id: parkId },
            select: { capacity: true },
        });

        // Calculate capacity usage for today
        const capacity = park?.capacity || 500;
        const capacityUsed = todayVisitors._sum.numberOfVisitors || 0;
        const capacityPercentage = capacity > 0 ? Math.round((capacityUsed / capacity) * 100) : 0;

        // Total revenue for this park
        const revenue = await prisma.reservation.aggregate({
            where: {
                parkId,
                status: ReservationStatus.CONFIRMED,
            },
            _sum: { totalAmount: true },
        });

        // Upcoming bookings (next 7 days)
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const upcomingBookings = await prisma.reservation.findMany({
            where: {
                parkId,
                visitDate: {
                    gte: today,
                    lte: nextWeek,
                },
                status: ReservationStatus.CONFIRMED,
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                visitDate: 'asc',
            },
            take: 10,
        });

        // Recent reservations
        const recentReservations = await prisma.reservation.findMany({
            where: { parkId },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });

        // Pending reservations (awaiting payment)
        const pendingCount = await prisma.reservation.count({
            where: {
                parkId,
                status: ReservationStatus.PENDING,
            },
        });

        return {
            park: ranger.park,
            stats: {
                totalReservations,
                todayVisitors: todayVisitors._sum.numberOfVisitors || 0,
                todayReservations: todayReservationsCount,
                pendingCheckIns,
                scannedTickets,
                pendingReservations: pendingCount,
                totalRevenue: Number(revenue._sum.totalAmount || 0),
                capacity,
                capacityUsed,
                capacityPercentage,
            },
            upcomingBookings,
            recentReservations,
        };
    }

    // Admin Analytics - System-wide statistics
    async getAdminAnalytics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total users by role
        const totalUsers = await prisma.user.count();
        const tourists = await prisma.user.count({
            where: { role: 'TOURIST' },
        });
        const rangers = await prisma.user.count({
            where: { role: 'RANGER' },
        });
        const admins = await prisma.user.count({
            where: { role: 'ADMIN' },
        });

        // Total reservations
        const totalReservations = await prisma.reservation.count();
        const confirmedReservations = await prisma.reservation.count({
            where: { status: ReservationStatus.CONFIRMED },
        });
        const pendingReservations = await prisma.reservation.count({
            where: { status: ReservationStatus.PENDING },
        });

        // Total revenue
        const revenue = await prisma.reservation.aggregate({
            where: { status: ReservationStatus.CONFIRMED },
            _sum: { totalAmount: true },
        });

        // Revenue this month
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthRevenue = await prisma.reservation.aggregate({
            where: {
                status: ReservationStatus.CONFIRMED,
                createdAt: { gte: firstDayOfMonth },
            },
            _sum: { totalAmount: true },
        });

        // Park statistics
        const parkStats = await prisma.park.findMany({
            select: {
                id: true,
                name: true,
                province: true,
                capacity: true,
                status: true,
                _count: {
                    select: {
                        reservations: true,
                    },
                },
            },
        });

        // Get revenue per park with full details
        const parkRevenue = await Promise.all(
            parkStats.map(async (park) => {
                const rev = await prisma.reservation.aggregate({
                    where: {
                        parkId: park.id,
                        status: ReservationStatus.CONFIRMED,
                    },
                    _sum: { totalAmount: true },
                });
                return {
                    id: park.id,
                    parkName: park.name,
                    province: park.province,
                    capacity: park.capacity,
                    status: park.status,
                    reservations: park._count.reservations,
                    revenue: Number(rev._sum.totalAmount) || 0,
                };
            })
        );

        // Recent activity
        const recentReservations = await prisma.reservation.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                park: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });

        // Daily reservations (last 7 days)
        const dailyReservations: Array<{ date: string; count: number }> = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = await prisma.reservation.count({
                where: {
                    createdAt: {
                        gte: date,
                        lt: nextDate,
                    },
                    status: ReservationStatus.CONFIRMED,
                },
            });

            dailyReservations.push({
                date: date.toISOString().split('T')[0],
                count,
            });
        }

        // Monthly reservations (last 6 months)
        const monthlyReservations: Array<{ month: string; count: number }> = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            date.setDate(1);
            date.setHours(0, 0, 0, 0);
            const nextMonth = new Date(date);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            const count = await prisma.reservation.count({
                where: {
                    createdAt: {
                        gte: date,
                        lt: nextMonth,
                    },
                    status: ReservationStatus.CONFIRMED,
                },
            });

            monthlyReservations.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                count,
            });
        }

        return {
            users: {
                total: totalUsers,
                tourists,
                rangers,
                admins,
            },
            reservations: {
                total: totalReservations,
                confirmed: confirmedReservations,
                pending: pendingReservations,
            },
            revenue: {
                total: Number(revenue._sum.totalAmount) || 0,
                thisMonth: Number(monthRevenue._sum.totalAmount) || 0,
            },
            parks: parkRevenue,
            dailyReservations,
            monthlyReservations,
            recentActivity: recentReservations,
        };
    }
}
