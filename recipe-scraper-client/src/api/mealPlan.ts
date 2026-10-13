import { api } from '../utils/api';
import type { Recipe } from './recipes';

export interface MealPlanEntry {
    _id: string;
    date: string; // 'YYYY-MM-DD'
    servings: number | null; // null = Portionen des Rezepts
    recipeId: Pick<
        Recipe,
        '_id' | 'title' | 'imageUrl' | 'ingredients' | 'servings'
    >;
}

export const getMealPlan = (from: string, to: string) =>
    api.get<MealPlanEntry[]>(`/mealplan?from=${from}&to=${to}`);

export const addMeal = (
    date: string,
    recipeId: string,
    servings: number | null,
) => api.post<MealPlanEntry>('/mealplan', { date, recipeId, servings });

export const updateMeal = (id: string, servings: number | null) =>
    api.patch<MealPlanEntry>(`/mealplan/${id}`, { servings });

export const removeMeal = (id: string) => api.delete<void>(`/mealplan/${id}`);
