import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
    listCommunity,
    listRecipes,
    addCommunityRecipeToLibrary,
    type Recipe,
} from '../api/recipes';
import { useAuth } from '../context/AuthContext';
import { RiArrowLeftLine } from 'react-icons/ri';

const authorName = (userId: Recipe['userId']): string =>
    typeof userId === 'object' && userId?.name ? userId.name : 'Anonymous';

const CommunityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [alreadyInLibrary, setAlreadyInLibrary] = useState(false);

    //reuse listCommunity() instead of a GET /:id route — mirrors RecipeDetail
    useEffect(() => {
        listCommunity()
            .then((rs) => setRecipe(rs.find((r) => r._id === id) ?? null))
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
    }, [id]);

    // Flag if the logged-in user already has this recipe (by source) in their library.
    useEffect(() => {
        if (!user || !recipe?.sourceUrl) return;
        listRecipes()
            .then((rs) =>
                setAlreadyInLibrary(
                    rs.some((r) => r.sourceUrl === recipe.sourceUrl),
                ),
            )
            .catch(() => {});
    }, [user, recipe?.sourceUrl]);

    const add = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!recipe) return;
        setSaving(true);
        try {
            await addCommunityRecipeToLibrary(recipe);
            setSaved(true);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSaving(false);
        }
    };

    if (loading)
        return <p className="p-8 font-sans text-text-subtle">Loading…</p>;
    if (!recipe)
        return (
            <div className="p-8 font-sans text-text-subtle">
                <p>Recipe not found.</p>
                <Link to="/community" className="text-mint underline">
                    ← Back to community
                </Link>
            </div>
        );

    return (
        <div className="flex w-full flex-col items-center gap-6 px-4 py-8">
            <div className="flex w-full max-w-5xl items-center justify-between font-sans">
                <Link
                    to="/community"
                    className="text-text-muted hover:text-primary"
                >
                    <RiArrowLeftLine size={24} />
                </Link>
                <button
                    onClick={add}
                    disabled={saving || saved || alreadyInLibrary}
                    className="rounded-full bg-gradient-brand px-5 py-2 font-semibold text-bg hover:brightness-110 disabled:opacity-60"
                >
                    {saved || alreadyInLibrary
                        ? saved
                            ? 'Saved'
                            : 'Already in your library'
                        : saving
                          ? 'Saving…'
                          : user
                            ? 'Add to my library'
                            : 'Log in to save'}
                </button>
            </div>

            {error && <p className="font-sans text-danger">{error}</p>}
            {saved && (
                <p className="font-sans text-mint">Saved to your library ✓</p>
            )}

            <div className="w-full max-w-5xl">
                {recipe.imageUrl ? (
                    <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="max-h-72 w-full rounded-2xl object-cover shadow-card"
                    />
                ) : (
                    <div className="flex h-48 w-full items-center justify-center rounded-2xl bg-gradient-brand font-sans text-bg">
                        Noch kein Bild
                    </div>
                )}
            </div>

            <div className="w-full max-w-5xl rounded-2xl border border-border bg-glass p-6 shadow-card backdrop-blur-md">
                <div className="flex items-baseline justify-between gap-4">
                    <h1 className="text-2xl font-semibold text-text">
                        {recipe.title}
                    </h1>
                    <span className="font-sans text-sm text-text-subtle">
                        by {authorName(recipe.userId)}
                    </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-4 font-sans text-sm text-text-subtle">
                    {recipe.category && <span>{recipe.category}</span>}
                    {recipe.cookTimeMinutes != null && (
                        <span>{recipe.cookTimeMinutes} min</span>
                    )}
                    {recipe.servings != null && (
                        <span>{recipe.servings} servings</span>
                    )}
                </div>

                <h2 className="mt-6 text-lg font-semibold text-text">
                    Zutaten
                </h2>
                <ul className="mt-2 list-disc pl-5 font-sans text-text">
                    {recipe.ingredients.map((ing, i) => (
                        <li key={i}>
                            {[ing.amount, ing.unit, ing.name]
                                .filter((x) => x != null && x !== '')
                                .join(' ')}
                        </li>
                    ))}
                </ul>

                <h2 className="mt-6 text-lg font-semibold text-text">
                    Zubereitung
                </h2>
                <ol className="mt-2 list-decimal space-y-2 pl-5 font-sans text-text">
                    {recipe.instructions.map((step, i) => (
                        <li key={i}>{step}</li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

export default CommunityDetail;
