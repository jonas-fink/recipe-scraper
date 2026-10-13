import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email('Ungültige E-Mail-Adresse'),
    password: z.string().min(1, 'Pflichtfeld'),
});

export const signupSchema = z.object({
    name: z.string().trim().optional(), // leer erlaubt; SignupPage schickt dann undefined
    email: z.email('Ungültige E-Mail-Adresse'),
    password: z.string().min(8, 'Mindestens 8 Zeichen'),
});

export const changeEmailSchema = z.object({
    email: z.email('Ungültige E-Mail-Adresse'),
    currentPassword: z.string().min(1, 'Pflichtfeld'),
});

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Pflichtfeld'),
        newPassword: z.string().min(8, 'Mindestens 8 Zeichen'),
        confirmNewPassword: z.string().min(1, 'Pflichtfeld'),
    })
    .refine((d) => d.newPassword === d.confirmNewPassword, {
        path: ['confirmNewPassword'],
        message: 'Passwörter stimmen nicht überein',
    });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof signupSchema>;
export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
