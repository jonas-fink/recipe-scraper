import { useEffect, useState } from 'react';
import {
    listRecipes,
    updateRecipe,
    FOOD_CATEGORIES,
    type Recipe,
    type RecipePatch,
} from '../api/recipes';

const Library = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [favoritesOnly, setFavoritesOnly] = useState(false);

    useEffect(() => {
        listRecipes()
            .then(setRecipes)
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
    }, []);

    const patch = async (id: string, patch: RecipePatch) => {
        const updated = await updateRecipe(id, patch);
        setRecipes((rs) => rs.map((r) => (r._id === id ? updated : r)));
    };

    const shown = favoritesOnly
        ? recipes.filter((r) => r.isFavorite)
        : recipes;

    if (loading)
        return <p className="p-8 font-sans text-text-subtle">Loading…</p>;

    return (
        <div className="flex w-full flex-col items-center gap-6 px-4 py-8 font-display">
            <div className="flex w-full max-w-2xl items-center justify-between">
                <h2 className="text-2xl font-bold text-text">My Library</h2>
                <label className="flex items-center gap-2 font-sans text-sm text-text-subtle">
                    <input
                        type="checkbox"
                        checked={favoritesOnly}
                        onChange={(e) => setFavoritesOnly(e.target.checked)}
                    />
                    Favorites only
                </label>
            </div>

            {error && <p className="font-sans text-danger">{error}</p>}
            {shown.length === 0 && (
                <p className="font-sans text-text-subtle">No recipes yet.</p>
            )}

            {shown.map((r) => (
                <div
                    key={r._id}
                    className="w-full max-w-2xl rounded-2xl border border-border bg-glass p-6 shadow-card backdrop-blur-md"
                >
                    <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold text-text">
                            {r.title}
                        </h3>
                        <button
                            onClick={() =>
                                patch(r._id!, { isFavorite: !r.isFavorite })
                            }
                            title="Toggle favorite"
                            className="text-2xl leading-none"
                        >
                            {r.isFavorite ? '★' : '☆'}
                        </button>
                    </div>

                    {r.imageUrl && (
                        <img
                            src={r.imageUrl}
                            alt={r.title}
                            className="mt-3 max-h-48 w-full rounded-md object-cover"
                        />
                    )}

                    <div className="mt-4 flex flex-col gap-3 font-sans">
                        <input
                            list="food-categories"
                            placeholder="Category"
                            defaultValue={r.category ?? ''}
                            onBlur={(e) =>
                                patch(r._id!, {
                                    category: e.target.value || null,
                                })
                            }
                            className="rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-border-strong"
                        />
                        <input
                            placeholder="Image URL (Cloudinary later)"
                            defaultValue={r.imageUrl ?? ''}
                            onBlur={(e) =>
                                patch(r._id!, {
                                    imageUrl: e.target.value || null,
                                })
                            }
                            className="rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-border-strong"
                        />
                        <button
                            onClick={() =>
                                patch(r._id!, { isPublished: !r.isPublished })
                            }
                            className="self-start rounded-full bg-gradient-brand px-5 py-2 font-semibold text-bg"
                        >
                            {r.isPublished
                                ? 'Unpublish'
                                : 'Publish to community'}
                        </button>
                    </div>
                </div>
            ))}

            <datalist id="food-categories">
                {FOOD_CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                ))}
            </datalist>
        </div>
    );
};

export default Library;
