import type { RequestHandler } from 'express';
import { extractText, parseRecipe } from '#services';
import { Recipe } from '#models';

/** POST /api/v1/recipes/extract — scrapen + parsen, NICHT speichern (Preview-Draft). */
export const extract: RequestHandler = async (req, res, next) => {
    try {
        const { url } = req.body as { url: string };
        const { text } = await extractText(url);
        const recipe = await parseRecipe(text);
        res.json({ data: { ...recipe, sourceUrl: url, status: 'draft' } });
    } catch (err) {
        next(err);
    }
};

/** POST /api/v1/recipes — vom User bestätigtes/editiertes Rezept speichern. */
export const create: RequestHandler = async (req, res, next) => {
    try {
        const saved = await Recipe.create({
            ...req.body,
            userId: req.userId,
            status: 'saved',
        });
        res.status(201).json({ data: saved });
    } catch (err) {
        next(err);
    }
};

/** GET /api/v1/recipes — eigene Rezepte (neueste zuerst). */
export const list: RequestHandler = async (req, res, next) => {
    try {
        const recipes = await Recipe.find({ userId: req.userId }).sort({
            createdAt: -1,
        });
        res.json({ data: recipes });
    } catch (err) {
        next(err);
    }
};

/** PATCH /api/v1/recipes/:id — eigene Rezept-Metadaten aktualisieren. */
export const update: RequestHandler = async (req, res, next) => {
    try {
        const updated = await Recipe.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { returnDocument: 'after' },
        );
        if (!updated) {
            res.status(404).json({ message: 'Recipe not found' });
            return;
        }
        res.json({ data: updated });
    } catch (err) {
        next(err);
    }
};

/** POST /api/v1/recipes/:id/image — Bild zu Cloudinary hochladen (via fileUploadHandler) und imageUrl setzen. */
export const uploadImage: RequestHandler = async (req, res, next) => {
    try {
        const { imageUrl } = req.body as { imageUrl?: string };
        if (!imageUrl) {
            res.status(400).json({ message: 'No image uploaded' });
            return;
        }
        const updated = await Recipe.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { imageUrl },
            { returnDocument: 'after' },
        );
        if (!updated) {
            res.status(404).json({ message: 'Recipe not found' });
            return;
        }
        res.json({ data: updated });
    } catch (err) {
        next(err);
    }
};

/** GET /api/v1/recipes/community — öffentlich publizierte Rezepte. */
export const community: RequestHandler = async (_req, res, next) => {
    try {
        const recipes = await Recipe.find({ isPublished: true })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });
        res.json({ data: recipes });
    } catch (err) {
        next(err);
    }
};
