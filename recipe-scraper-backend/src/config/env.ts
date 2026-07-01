import { z } from 'zod';

// Fail fast on boot instead of throwing at request time when a secret is missing.
const schema = z.object({
    MONGO_URI: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),
    CLIENT_URL: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1),
    CLOUDINARY_NAME: z.string().min(1),
    CLOUDINARY_KEY: z.string().min(1),
    CLOUDINARY_SECRET: z.string().min(1),
});

export const validateEnv = (): void => {
    const result = schema.safeParse(process.env);
    if (!result.success) {
        console.error(
            'Missing/invalid environment variables:\n',
            z.prettifyError(result.error),
        );
        process.exit(1);
    }
};
