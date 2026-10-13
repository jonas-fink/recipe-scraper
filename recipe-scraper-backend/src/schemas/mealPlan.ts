import { z } from 'zod';

const servings = z.number().positive().nullable();

export const mealPlanEntrySchema = z.object({
    date: z.iso.date(),
    recipeId: z.string().min(1),
    servings: servings.optional(),
});

export const mealPlanUpdateSchema = z.object({ servings });

export const mealPlanQuerySchema = z.object({
    from: z.iso.date(),
    to: z.iso.date(),
});
