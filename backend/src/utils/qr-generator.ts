import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(data, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 1,
        });
        return qrCodeDataUrl;
    } catch (error) {
        throw new Error('Failed to generate QR code');
    }
};

export const generateQRCodeBuffer = async (data: string): Promise<Buffer> => {
    try {
        const buffer = await QRCode.toBuffer(data, {
            errorCorrectionLevel: 'H',
            type: 'png',
            width: 300,
            margin: 1,
        });
        return buffer;
    } catch (error) {
        throw new Error('Failed to generate QR code buffer');
    }
};
