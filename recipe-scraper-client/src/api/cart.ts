import { api } from '../utils/api';
import type { Ingredient } from './recipes';

export const getCart = () => api.get<Ingredient[]>('/cart');

export const addToCart = (ingredients: Ingredient[]) =>
    api.post<Ingredient[]>('/cart', { ingredients });

export const setCart = (ingredients: Ingredient[]) =>
    api.put<Ingredient[]>('/cart', { ingredients });
