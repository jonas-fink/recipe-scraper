import type { RequestHandler } from 'express';
import { MealPlan, Recipe } from '#models';

const FIELDS = 'title imageUrl ingredients servings';

/** GET /api/v1/mealplan?from&to — geplante Rezepte im Zeitraum (inkl.). */
export const getMealPlan: RequestHandler = async (req, res) => {
    const { from, to } = req.query as { from: string; to: string };
    const entries = await MealPlan.find({
        userId: req.userId,
        date: { $gte: from, $lte: to },
    })
        .sort({ date: 1, createdAt: 1 })
        .populate('recipeId', FIELDS);
    res.json({ data: entries });
};

/** POST /api/v1/mealplan — Rezept an einem Tag einplanen. */
export const addMeal: RequestHandler = async (req, res) => {
    const { date, recipeId, servings } = req.body as {
        date: string;
        recipeId: string;
        servings?: number | null;
    };
    const owns = await Recipe.exists({ _id: recipeId, userId: req.userId });
    if (!owns) {
        res.status(404).json({ message: 'Recipe not found' });
        return;
    }
    const entry = await MealPlan.create({
        userId: req.userId,
        date,
        recipeId,
        servings,
    });
    await entry.populate('recipeId', FIELDS);
    res.status(201).json({ data: entry });
};

/** PATCH /api/v1/mealplan/:id — Portionen eines Eintrags ändern. */
export const updateMeal: RequestHandler = async (req, res) => {
    const entry = await MealPlan.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { servings: req.body.servings },
        { returnDocument: 'after' },
    ).populate('recipeId', FIELDS);
    if (!entry) {
        res.status(404).json({ message: 'Entry not found' });
        return;
    }
    res.json({ data: entry });
};

/** DELETE /api/v1/mealplan/:id — Eintrag entfernen. */
export const removeMeal: RequestHandler = async (req, res) => {
    const deleted = await MealPlan.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId,
    });
    if (!deleted) {
        res.status(404).json({ message: 'Entry not found' });
        return;
    }
    res.status(204).end();
};
