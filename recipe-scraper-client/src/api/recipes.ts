import { api } from '../utils/api';

export const FOOD_CATEGORIES = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Dessert',
    'Snack',
    'Drink',
    'Vegetarian',
    'Vegan',
];

export interface Ingredient {
    name: string;
    amount: number | null;
    unit: string | null;
}

export interface Recipe {
    _id?: string;
    title: string;
    ingredients: Ingredient[];
    instructions: string[];
    sourceUrl: string;
    status?: string;
    category?: string | null;
    cookTimeMinutes?: number | null;
    servings?: number | null;
    imageUrl?: string | null;
    isPublished?: boolean;
    isFavorite?: boolean;
    userId?: { name?: string } | string;
}

export type RecipePatch = Partial<
    Pick<
        Recipe,
        | 'title'
        | 'ingredients'
        | 'instructions'
        | 'category'
        | 'cookTimeMinutes'
        | 'servings'
        | 'imageUrl'
        | 'isPublished'
        | 'isFavorite'
    >
>;

export const extractRecipe = (url: string) =>
    api.post<Recipe>('/recipes/extract', { url });

export const saveRecipe = (recipe: Recipe) =>
    api.post<Recipe>('/recipes', recipe);

// Snapshot a community recipe into the current user's library as an independent copy.
export const addCommunityRecipeToLibrary = (r: Recipe) =>
    saveRecipe({
        title: r.title,
        ingredients: r.ingredients,
        instructions: r.instructions,
        category: r.category ?? null,
        cookTimeMinutes: r.cookTimeMinutes ?? null,
        servings: r.servings ?? null,
        sourceUrl: r.sourceUrl,
        ...(r.imageUrl ? { imageUrl: r.imageUrl } : {}),
    } as Recipe);

export const listRecipes = () => api.get<Recipe[]>('/recipes');

export const updateRecipe = (id: string, patch: RecipePatch) =>
    api.patch<Recipe>(`/recipes/${id}`, patch);

export const listCommunity = () => api.get<Recipe[]>('/recipes/community');

export const uploadRecipeImage = (id: string, file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.upload<Recipe>(`/recipes/${id}/image`, form);
};
