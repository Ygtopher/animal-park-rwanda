export interface PaymentConfig {
    mtn: {
        apiKey: string;
        apiSecret: string;
        subscriptionKey: string;
        baseUrl: string;
    };
    airtel: {
        apiKey: string;
        apiSecret: string;
        baseUrl: string;
    };
}

export const paymentConfig: PaymentConfig = {
    mtn: {
        apiKey: process.env.MTN_MOMO_API_KEY || '',
        apiSecret: process.env.MTN_MOMO_API_SECRET || '',
        subscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY || '',
        baseUrl: process.env.MTN_MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com',
    },
    airtel: {
        apiKey: process.env.AIRTEL_MONEY_API_KEY || '',
        apiSecret: process.env.AIRTEL_MONEY_API_SECRET || '',
        baseUrl: process.env.AIRTEL_MONEY_BASE_URL || 'https://openapiuat.airtel.africa',
    },
};
