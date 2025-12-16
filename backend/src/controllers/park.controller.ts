import { Request, Response } from 'express';
import { ParkService } from '../services/park.service';
import { AuthRequest } from '../middleware/auth.middleware';

const parkService = new ParkService();

export class ParkController {
    async getAllParks(req: Request, res: Response): Promise<void> {
        try {
            const { province, status, search } = req.query;

            const parks = await parkService.getAllParks({
                province: province as any,
                status: status as any,
                search: search as string,
            });

            res.status(200).json({
                success: true,
                data: parks,
                count: parks.length,
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async getParkById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const park = await parkService.getParkById(id);

            res.status(200).json({
                success: true,
                data: park,
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async createPark(req: AuthRequest, res: Response): Promise<void> {
        try {
            const park = await parkService.createPark(req.body);

            res.status(201).json({
                success: true,
                data: park,
                message: 'Park created successfully',
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async updatePark(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const park = await parkService.updatePark(id, req.body);

            res.status(200).json({
                success: true,
                data: park,
                message: 'Park updated successfully',
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async deletePark(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            await parkService.deletePark(id);

            res.status(200).json({
                success: true,
                message: 'Park deleted successfully',
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async checkAvailability(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { date } = req.query;

            if (!date) {
                res.status(400).json({
                    success: false,
                    error: 'Date parameter is required',
                });
                return;
            }

            const availability = await parkService.checkAvailability(
                id,
                new Date(date as string)
            );

            res.status(200).json({
                success: true,
                data: availability,
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async getAnimals(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const animals = await parkService.getAnimals(id);

            res.status(200).json({
                success: true,
                data: animals,
                count: animals.length,
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async addAnimal(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const animal = await parkService.addAnimal(id, req.body);

            res.status(201).json({
                success: true,
                data: animal,
                message: 'Animal added successfully',
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async updateAnimal(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { animalId } = req.params;

            const animal = await parkService.updateAnimal(animalId, req.body);

            res.status(200).json({
                success: true,
                data: animal,
                message: 'Animal updated successfully',
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async deleteAnimal(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { animalId } = req.params;

            await parkService.deleteAnimal(animalId);

            res.status(200).json({
                success: true,
                message: 'Animal deleted successfully',
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message,
            });
        }
    }
}
