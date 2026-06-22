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
    imageUrl?: string | null;
    isPublished?: boolean;
    isFavorite?: boolean;
    userId?: { name?: string } | string;
}

export type RecipePatch = Partial<
    Pick<Recipe, 'category' | 'imageUrl' | 'isPublished' | 'isFavorite'>
>;

export const extractRecipe = (url: string) =>
    api.post<Recipe>('/recipes/extract', { url });

export const saveRecipe = (recipe: Recipe) =>
    api.post<Recipe>('/recipes', recipe);

export const listRecipes = () => api.get<Recipe[]>('/recipes');

export const updateRecipe = (id: string, patch: RecipePatch) =>
    api.patch<Recipe>(`/recipes/${id}`, patch);

export const listCommunity = () => api.get<Recipe[]>('/recipes/community');
