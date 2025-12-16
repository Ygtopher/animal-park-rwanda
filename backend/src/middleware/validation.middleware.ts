import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodObject<any, any>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errorMessages,
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                });
            }
        }
    };
};
