import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { generateAccessToken, generateRefreshToken, JwtPayload } from '../config/jwt';
import { AppError } from '../middleware/error.middleware';
import { User, UserRole } from '@prisma/client';

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async register(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string;
    }): Promise<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string }> {
        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new AppError('User with this email already exists', 400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const user = await this.userRepository.create({
            ...data,
            password: hashedPassword,
            role: UserRole.TOURIST,
        });

        // Generate tokens
        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }

    async login(email: string, password: string): Promise<{
        user: Omit<User, 'password'>;
        accessToken: string;
        refreshToken: string;
    }> {
        // Find user
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }

        // Generate tokens
        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }

    async getCurrentUser(userId: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            return null;
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new AppError('Current password is incorrect', 401);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await this.userRepository.update(userId, { password: hashedPassword });
    }
}
