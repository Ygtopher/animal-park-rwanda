import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface TicketData {
    bookingReference: string;
    parkName: string;
    visitDate: string;
    numberOfVisitors: number;
    totalAmount: string;
    qrCodeBuffer: Buffer;
    visitorName: string;
}

export const generateTicketPDF = async (ticketData: TicketData): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc
                .fontSize(24)
                .font('Helvetica-Bold')
                .text('Animal Park Rwanda', { align: 'center' })
                .moveDown(0.5);

            doc
                .fontSize(18)
                .font('Helvetica')
                .text('E-Ticket', { align: 'center' })
                .moveDown(1);

            // Ticket details
            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .text('Booking Reference:', 50, doc.y)
                .font('Helvetica')
                .text(ticketData.bookingReference, 200, doc.y - 12)
                .moveDown(0.5);

            doc
                .font('Helvetica-Bold')
                .text('Visitor Name:', 50, doc.y)
                .font('Helvetica')
                .text(ticketData.visitorName, 200, doc.y - 12)
                .moveDown(0.5);

            doc
                .font('Helvetica-Bold')
                .text('Park:', 50, doc.y)
                .font('Helvetica')
                .text(ticketData.parkName, 200, doc.y - 12)
                .moveDown(0.5);

            doc
                .font('Helvetica-Bold')
                .text('Visit Date:', 50, doc.y)
                .font('Helvetica')
                .text(ticketData.visitDate, 200, doc.y - 12)
                .moveDown(0.5);

            doc
                .font('Helvetica-Bold')
                .text('Number of Visitors:', 50, doc.y)
                .font('Helvetica')
                .text(ticketData.numberOfVisitors.toString(), 200, doc.y - 12)
                .moveDown(0.5);

            doc
                .font('Helvetica-Bold')
                .text('Total Amount:', 50, doc.y)
                .font('Helvetica')
                .text(ticketData.totalAmount, 200, doc.y - 12)
                .moveDown(2);

            // QR Code
            doc
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('Scan this QR code at the park entrance:', { align: 'center' })
                .moveDown(1);

            const qrX = (doc.page.width - 200) / 2;
            doc.image(ticketData.qrCodeBuffer, qrX, doc.y, { width: 200 });
            doc.moveDown(12);

            // Footer
            doc
                .fontSize(10)
                .font('Helvetica')
                .text('Please present this ticket at the park entrance.', { align: 'center' })
                .moveDown(0.5)
                .text('For inquiries, contact: info@animalpark.rw', { align: 'center' })
                .text('Phone: +250 788 000 000', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
