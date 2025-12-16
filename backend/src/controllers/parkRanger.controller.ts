import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class ParkRangerController {
    async assignRangerToPark(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { userId, parkId } = req.body;

            if (!userId || !parkId) {
                res.status(400).json({
                    success: false,
                    error: 'User ID and Park ID are required',
                });
                return;
            }

            // Check if user exists and is a ranger
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: 'User not found',
                });
                return;
            }

            if (user.role !== 'RANGER') {
                res.status(400).json({
                    success: false,
                    error: 'User must be a ranger to be assigned to a park',
                });
                return;
            }

            // Check if park exists
            const park = await prisma.park.findUnique({
                where: { id: parkId },
            });

            if (!park) {
                res.status(404).json({
                    success: false,
                    error: 'Park not found',
                });
                return;
            }

            // Check if ranger is already assigned to a park
            const existingAssignment = await prisma.parkRanger.findFirst({
                where: { userId },
            });

            if (existingAssignment) {
                // Update existing assignment
                const updated = await prisma.parkRanger.update({
                    where: { id: existingAssignment.id },
                    data: { parkId },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                        park: {
                            select: {
                                id: true,
                                name: true,
                                province: true,
                            },
                        },
                    },
                });

                res.status(200).json({
                    success: true,
                    message: 'Ranger park assignment updated successfully',
                    data: updated,
                });
            } else {
                // Create new assignment
                const assignment = await prisma.parkRanger.create({
                    data: {
                        userId,
                        parkId,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                        park: {
                            select: {
                                id: true,
                                name: true,
                                province: true,
                            },
                        },
                    },
                });

                res.status(201).json({
                    success: true,
                    message: 'Ranger assigned to park successfully',
                    data: assignment,
                });
            }
        } catch (error: any) {
            console.error('Assign ranger error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to assign ranger to park',
            });
        }
    }

    async getRangerAssignment(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            const assignment = await prisma.parkRanger.findFirst({
                where: { userId },
                include: {
                    park: {
                        select: {
                            id: true,
                            name: true,
                            province: true,
                        },
                    },
                },
            });

            res.status(200).json({
                success: true,
                data: assignment,
            });
        } catch (error: any) {
            console.error('Get ranger assignment error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get ranger assignment',
            });
        }
    }
}
