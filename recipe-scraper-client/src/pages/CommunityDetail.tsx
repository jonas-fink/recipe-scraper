import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
    listCommunity,
    listRecipes,
    addCommunityRecipeToLibrary,
    type Recipe,
} from '../api/recipes';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Check, Globe, Plus } from 'lucide-react';
import RecipeView from '../components/RecipeView';

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

    if (loading) return <p className="p-8 text-text-muted">Lädt…</p>;
    if (!recipe)
        return (
            <div className="flex flex-col gap-2 p-8 text-text-muted">
                <p>Rezept nicht gefunden.</p>
                <Link to="/community" className="text-primary underline">
                    ← Zurück zur Community
                </Link>
            </div>
        );

    const done = saved || alreadyInLibrary;
    const iconButton =
        'flex size-11 items-center justify-center rounded-md border border-border bg-surface text-text hover:border-border-strong';

    return (
        <div className="flex min-w-0 w-full max-w-5xl flex-col gap-5 px-5 py-5">
            <div className="flex items-center justify-between gap-2">
                <Link
                    to="/community"
                    aria-label="Zurück zur Community"
                    className={iconButton}
                >
                    <ArrowLeft size={20} strokeWidth={1.5} aria-hidden />
                </Link>
                {recipe.sourceUrl && (
                    <a
                        href={recipe.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-11 items-center gap-1.5 rounded-md border border-border bg-surface px-3 font-mono text-xs text-text hover:border-border-strong"
                    >
                        <Globe size={16} strokeWidth={1.5} aria-hidden />
                        Original
                    </a>
                )}
            </div>

            {recipe.imageUrl ? (
                <img
                    src={recipe.imageUrl}
                    alt=""
                    className="max-h-80 w-full rounded-lg object-cover"
                />
            ) : (
                <div className="h-40 w-full rounded-lg bg-elevated" />
            )}

            <RecipeView recipe={recipe} byline={`von ${authorName(recipe.userId)}`} />

            {error && (
                <p role="alert" className="text-danger">
                    {error}
                </p>
            )}

            <button
                onClick={add}
                disabled={saving || done}
                className="flex h-13 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary font-bold text-bg hover:bg-primary-soft disabled:cursor-default disabled:bg-elevated disabled:text-text-muted md:self-start md:px-8"
            >
                {done ? (
                    <Check size={20} aria-hidden />
                ) : (
                    <Plus size={20} aria-hidden />
                )}
                {saved
                    ? 'In deiner Bibliothek gespeichert'
                    : alreadyInLibrary
                      ? 'Schon in deiner Bibliothek'
                      : saving
                        ? 'Speichere…'
                        : user
                          ? 'In meine Bibliothek'
                          : 'Anmelden zum Speichern'}
            </button>
        </div>
    );
};

export default CommunityDetail;
