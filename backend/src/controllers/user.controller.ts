import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export class UserController {
    // Create new user (Admin only - for creating staff accounts)
    static async createUser(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { email, password, firstName, lastName, phone, role } = req.body;

            // Validate role - only allow creating ADMIN or RANGER
            if (role !== 'ADMIN' && role !== 'RANGER') {
                res.status(400).json({ error: 'Can only create ADMIN or RANGER accounts' });
                return;
            }

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                res.status(400).json({ error: 'User with this email already exists' });
                return;
            }

            // Hash password
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const newUser = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    phone,
                    role,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    createdAt: true,
                },
            });

            res.status(201).json(newUser);
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    }

    // Get all users (Admin only)
    static async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    createdAt: true,
                    // Exclude password
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }

    // Update user role (Admin only)
    static async updateUserRole(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { role } = req.body;

            if (!Object.values(UserRole).includes(role)) {
                res.status(400).json({ error: 'Invalid role' });
                return;
            }

            // Prevent updating own role
            if (req.user?.userId === id) {
                res.status(403).json({ error: 'Cannot update your own role' });
                return;
            }

            const updatedUser = await prisma.user.update({
                where: { id },
                data: { role },
                select: {
                    id: true,
                    email: true,
                    role: true,
                },
            });

            res.json(updatedUser);
        } catch (error) {
            console.error('Error updating user role:', error);
            res.status(500).json({ error: 'Failed to update user role' });
        }
    }

    // Delete user (Admin only)
    static async deleteUser(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Prevent deleting self
            if (req.user?.userId === id) {
                res.status(403).json({ error: 'Cannot delete your own account' });
                return;
            }

            await prisma.user.delete({
                where: { id },
            });

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }
}
