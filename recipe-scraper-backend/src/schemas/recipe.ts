import { z } from 'zod';

export const ingredientSchema = z.object({
    name: z.string().min(1),
    amount: z.number().nullable(),
    unit: z.string().nullable(),
});

export const recipeSchema = z.object({
    title: z.string().min(1),
    ingredients: z.array(ingredientSchema),
    instructions: z.array(z.string().min(1)),
});

/** Body für POST /api/recipes/extract */
export const extractSchema = z.object({
    url: z.url(),
});

/** Body für POST /api/recipes (gespeichertes Rezept inkl. Quelle) */
export const saveRecipeSchema = recipeSchema.extend({
    sourceUrl: z.url(),
    category: z.string().min(1).optional(),
    imageUrl: z.url().optional(),
});

/** Body für PATCH /api/recipes/:id (Rezept-Metadaten aktualisieren) */
export const updateRecipeSchema = z.object({
    category: z.string().min(1).nullable().optional(),
    imageUrl: z.url().nullable().optional(),
    isPublished: z.boolean().optional(),
    isFavorite: z.boolean().optional(),
});

export type Recipe = z.infer<typeof recipeSchema>;
export type Ingredient = z.infer<typeof ingredientSchema>;
