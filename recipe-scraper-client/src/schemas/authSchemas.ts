import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(1, 'required'),
});

export const signupSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.email('Invalid email'),
    password: z.string().min(8, 'At least 8 characters'),
});

export const changeEmailSchema = z.object({
    email: z.email('Invalid email'),
    currentPassword: z.string().min(1, 'required'),
});

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'required'),
        newPassword: z.string().min(8, 'At least 8 characters'),
        confirmNewPassword: z.string().min(1, 'required'),
    })
    .refine((d) => d.newPassword === d.confirmNewPassword, {
        path: ['confirmNewPassword'],
        message: 'Passwords do not match',
    });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof signupSchema>;
export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
