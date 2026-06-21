import type { RequestHandler } from 'express';
import { extractText, parseRecipe } from '#services';
import { Recipe } from '#models';

/** POST /api/recipes/extract — scrapen + parsen, NICHT speichern (Preview-Draft). */
export const extract: RequestHandler = async (req, res, next) => {
    try {
        const { url } = req.body as { url: string };
        const { text } = await extractText(url);
        const recipe = await parseRecipe(text);
        res.json({ ...recipe, sourceUrl: url, status: 'draft' });
    } catch (err) {
        next(err);
    }
};

/** POST /api/recipes — vom User bestätigtes/editiertes Rezept speichern. */
export const create: RequestHandler = async (req, res, next) => {
    try {
        const saved = await Recipe.create({ ...req.body, status: 'saved' });
        res.status(201).json(saved);
    } catch (err) {
        next(err);
    }
};

/** GET /api/recipes — Liste (neueste zuerst). */
export const list: RequestHandler = async (_req, res, next) => {
    try {
        res.json(await Recipe.find().sort({ createdAt: -1 }));
    } catch (err) {
        next(err);
    }
};
