import type { RequestHandler } from 'express';
import { Cart } from '#models';
import type { Ingredient } from '#schemas';

const key = (i: { name: string; unit?: string | null }) =>
    `${i.name.trim().toLowerCase()}|${i.unit ?? ''}`;

/**
 * Merge `incoming` into `current`, matching on name+unit.
 * ponytail: sum amounts only when both are numeric; no unit conversion.
 */
export const mergeIngredients = (
    current: Ingredient[],
    incoming: Ingredient[],
): Ingredient[] => {
    const merged = current.map((i) => ({ ...i }));
    const byKey = new Map(merged.map((i) => [key(i), i]));
    for (const inc of incoming) {
        const existing = byKey.get(key(inc));
        if (!existing) {
            const copy = { ...inc };
            merged.push(copy);
            byKey.set(key(copy), copy);
        } else if (
            typeof existing.amount === 'number' &&
            typeof inc.amount === 'number'
        ) {
            existing.amount += inc.amount;
        }
    }
    return merged;
};

/** GET /api/v1/cart — eigener Warenkorb. */
export const getCart: RequestHandler = async (req, res) => {
    const cart = await Cart.findOne({ userId: req.userId });
    res.json({ data: cart?.ingredients ?? [] });
};

/** POST /api/v1/cart — Zutaten mergen (gleiche Zutat = Menge addieren). */
export const addToCart: RequestHandler = async (req, res) => {
    const { ingredients } = req.body as { ingredients: Ingredient[] };
    const cart = await Cart.findOneAndUpdate(
        { userId: req.userId },
        { $setOnInsert: { userId: req.userId } },
        { upsert: true, returnDocument: 'after' },
    );
    cart.ingredients = mergeIngredients(
        cart.ingredients.toObject(),
        ingredients,
    ) as typeof cart.ingredients;
    await cart.save();
    res.json({ data: cart.ingredients });
};

/** PUT /api/v1/cart — Zutatenliste ersetzen (entfernen / leeren). */
export const setCart: RequestHandler = async (req, res) => {
    const { ingredients } = req.body as { ingredients: Ingredient[] };
    const cart = await Cart.findOneAndUpdate(
        { userId: req.userId },
        { ingredients },
        { upsert: true, returnDocument: 'after' },
    );
    res.json({ data: cart.ingredients });
};
