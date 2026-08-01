import { ingredientSchema } from './recipe.ts';
import { z } from 'zod';

export const cartSchema = z.object({
    ingredients: z.array(ingredientSchema),
});

export type Cart = z.infer<typeof cartSchema>;
