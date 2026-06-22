import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().optional(),
    email: z.email('Invalid email'),
    password: z.string().min(8, 'At least 8 characters'),
    role: z.enum(['user', 'admin']).default('user'),
});

export const updateUserSchema = z
    .object({
        name: z.string().min(1).optional(),
        email: z.email('Invalid email').optional(),
        password: z.string().min(8, 'At least 8 characters').optional(),
        role: z.enum(['user', 'admin']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field required',
    });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
