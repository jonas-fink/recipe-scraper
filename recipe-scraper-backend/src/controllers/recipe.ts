import type { RequestHandler } from 'express';
import { extractText, parseRecipe, extractCache } from '#services';
import { Recipe } from '#models';

/** POST /api/v1/recipes/extract — scrapen + parsen, NICHT speichern (Preview-Draft). */
export const extract: RequestHandler = async (req, res) => {
    const { url } = req.body as { url: string };

    const cached = extractCache.get(url);
    if (cached) {
        res.json({ data: { ...cached, sourceUrl: url, status: 'draft' } });
        return;
    }

    const { text } = await extractText(url);
    const recipe = await parseRecipe(text);
    extractCache.set(url, recipe);
    res.json({ data: { ...recipe, sourceUrl: url, status: 'draft' } });
};

/** POST /api/v1/recipes — vom User bestätigtes/editiertes Rezept speichern. */
export const create: RequestHandler = async (req, res) => {
    // ponytail: sourceUrl is the recipe identity — no two library copies of the same source
    const { sourceUrl } = req.body as { sourceUrl: string };
    if (await Recipe.exists({ userId: req.userId, sourceUrl })) {
        res.status(409).json({ message: 'Recipe already in your library' });
        return;
    }
    const saved = await Recipe.create({
        ...req.body,
        userId: req.userId,
        status: 'saved',
    });
    res.status(201).json({ data: saved });
};

/** GET /api/v1/recipes — eigene Rezepte (neueste zuerst). */
export const list: RequestHandler = async (req, res) => {
    const recipes = await Recipe.find({ userId: req.userId }).sort({
        createdAt: -1,
    });
    res.json({ data: recipes });
};

/** PATCH /api/v1/recipes/:id — eigene Rezept-Metadaten aktualisieren. */
export const update: RequestHandler = async (req, res) => {
    // Prevent publishing a recipe the community already has (same source).
    if (req.body.isPublished === true) {
        const recipe = await Recipe.findOne({
            _id: req.params.id,
            userId: req.userId,
        });
        if (!recipe) {
            res.status(404).json({ message: 'Recipe not found' });
            return;
        }
        const dup = await Recipe.exists({
            _id: { $ne: recipe._id },
            isPublished: true,
            sourceUrl: recipe.sourceUrl,
        });
        if (dup) {
            res.status(409).json({
                message: 'This recipe is already published to the community',
            });
            return;
        }
    }
    const updated = await Recipe.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        req.body,
        { returnDocument: 'after' },
    );
    if (!updated) {
        res.status(404).json({ message: 'Recipe not found' });
        return;
    }
    communityCache = null; // publish/favorite may change the community list
    res.json({ data: updated });
};

/** POST /api/v1/recipes/:id/image — Bild zu Cloudinary hochladen (via fileUploadHandler) und imageUrl setzen. */
export const uploadImage: RequestHandler = async (req, res) => {
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
};

// ponytail: single shared response, short TTL — cheaper than per-publish invalidation.
let communityCache: { data: unknown; expires: number } | null = null;
const COMMUNITY_TTL_MS = 60 * 1000;

/** GET /api/v1/recipes/community — öffentlich publizierte Rezepte. */
export const community: RequestHandler = async (_req, res) => {
    if (communityCache && communityCache.expires > Date.now()) {
        res.json({ data: communityCache.data });
        return;
    }
    const recipes = await Recipe.find({ isPublished: true })
        .populate('userId', 'name')
        .sort({ createdAt: -1 });
    communityCache = { data: recipes, expires: Date.now() + COMMUNITY_TTL_MS };
    res.json({ data: recipes });
};
