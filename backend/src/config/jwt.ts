import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
    const options: any = { expiresIn: JWT_EXPIRES_IN };
    return jwt.sign(payload, JWT_SECRET, options);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
    const options: any = { expiresIn: JWT_REFRESH_EXPIRES_IN };
    return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN };
