const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTicketsForExistingReservations() {
    try {
        // Find all confirmed reservations without tickets
        const confirmedReservations = await prisma.reservation.findMany({
            where: {
                status: 'CONFIRMED',
                ticket: null,
            },
            include: {
                park: true,
            },
        });

        console.log(`Found ${confirmedReservations.length} confirmed reservations without tickets`);

        for (const reservation of confirmedReservations) {
            // Generate QR code (simplified for existing reservations)
            const qrCode = `QR-${reservation.bookingReference}-${Date.now()}`;

            // Create ticket
            await prisma.ticket.create({
                data: {
                    reservationId: reservation.id,
                    qrCode,
                    validFrom: new Date(),
                    validUntil: new Date(reservation.visitDate.getTime() + 24 * 60 * 60 * 1000),
                },
            });

            console.log(`✅ Created ticket for reservation: ${reservation.bookingReference}`);
        }

        console.log('\n🎉 Done! All confirmed reservations now have tickets.');
        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Error creating tickets:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

createTicketsForExistingReservations();
