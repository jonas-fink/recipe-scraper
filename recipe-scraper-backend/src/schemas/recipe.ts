import { z } from 'zod';

/** Kanonische Kategorienliste (spiegelt FOOD_CATEGORIES im Client). */
// ponytail: duplicated list — extract to a shared package only if a third consumer appears
export const CATEGORIES = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Dessert',
    'Snack',
    'Drink',
    'Vegetarian',
    'Vegan',
] as const;

export const ingredientSchema = z.object({
    name: z.string().min(1),
    amount: z.number().nullable(),
    unit: z.string().nullable(),
});

export const recipeSchema = z.object({
    title: z.string().min(1),
    ingredients: z.array(ingredientSchema),
    instructions: z.array(z.string().min(1)),
    // ponytail: lenient — tighten to z.enum(CATEGORIES) if the AI drifts off-list
    category: z.string().nullable(),
    cookTimeMinutes: z.number().nullable(),
    servings: z.number().nullable(),
});

/** Body für POST /api/recipes/extract */
export const extractSchema = z.object({
    url: z.url(),
});

/** Body für POST /api/recipes (gespeichertes Rezept inkl. Quelle) */
export const saveRecipeSchema = recipeSchema.extend({
    sourceUrl: z.url(),
    imageUrl: z.url().optional(),
});

/** Body für PATCH /api/recipes/:id (Rezept-Metadaten + Inhalt aktualisieren) */
export const updateRecipeSchema = recipeSchema.partial().extend({
    imageUrl: z.url().nullable().optional(),
    isPublished: z.boolean().optional(),
    isFavorite: z.boolean().optional(),
});

export type Recipe = z.infer<typeof recipeSchema>;
export type Ingredient = z.infer<typeof ingredientSchema>;
