const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface Ingredient {
    name: string;
    amount: number | null;
    unit: string | null;
}

export interface Recipe {
    title: string;
    ingredients: Ingredient[];
    instructions: string[];
    sourceUrl: string;
    status?: string;
}

const request = async <T>(path: string, body: unknown): Promise<T> => {
    const res = await fetch(`${API}/api/recipes${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Anfrage fehlgeschlagen');
    return data as T;
};

export const extractRecipe = (url: string) =>
    request<Recipe>('/extract', { url });

export const saveRecipe = (recipe: Recipe) =>
    request<Recipe & { _id: string }>('', recipe);
