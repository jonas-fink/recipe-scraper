import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
    ArrowLeft,
    CalendarDays,
    Camera,
    Check,
    ChefHat,
    Image as ImageIcon,
    LoaderCircle,
    Pencil,
    Share,
    ShoppingBasket,
    Trash2,
    X,
} from 'lucide-react';
import { RecipePreview } from '../components/RecipePreview';
import RecipeView from '../components/RecipeView';
import {
    listRecipes,
    listCommunity,
    updateRecipe,
    deleteRecipe,
    uploadRecipeImage,
    stripBlankRows,
    type Recipe,
} from '../api/recipes';
import { addToCart } from '../api/cart';
import { addMeal } from '../api/mealPlan';

const iconButton =
    'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md border bg-surface';

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [added, setAdded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [backup, setBackup] = useState<Recipe | null>(null);
    const [planning, setPlanning] = useState(false);
    const [planned, setPlanned] = useState('');
    const [communityUrls, setCommunityUrls] = useState<Set<string>>(new Set());

    useEffect(() => {
        listRecipes()
            .then((rs) => setRecipe(rs.find((r) => r._id === id) ?? null))
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
        // Quell-URLs, die schon in der Community sind — verhindert doppeltes Veröffentlichen.
        listCommunity()
            .then((rs) => setCommunityUrls(new Set(rs.map((r) => r.sourceUrl))))
            .catch(() => {});
    }, [id]);

    const save = async () => {
        if (!recipe?._id) return;
        setSaving(true);
        try {
            setRecipe(await updateRecipe(recipe._id, stripBlankRows(recipe)));
            setEditing(false);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        if (!recipe?._id) return;
        if (!window.confirm('Willst du dieses Rezept löschen?')) return;
        try {
            await deleteRecipe(recipe._id);
            navigate('/library');
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const togglePublished = async () => {
        if (!recipe?._id) return;
        try {
            setRecipe(
                await updateRecipe(recipe._id, {
                    isPublished: !recipe.isPublished,
                }),
            );
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const plan = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!recipe?._id) return;
        const date = String(new FormData(e.currentTarget).get('date'));
        try {
            await addMeal(date, recipe._id, null);
            setPlanning(false);
            setPlanned(
                new Date(`${date}T00:00`).toLocaleDateString('de-DE', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                }),
            );
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const addIngredients = async () => {
        if (!recipe) return;
        try {
            await addToCart(recipe.ingredients);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const onImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !recipe?._id) return;
        setUploading(true);
        try {
            setRecipe(await uploadRecipeImage(recipe._id, file));
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <p className="p-8 text-text-muted">Lädt…</p>;
    if (!recipe)
        return (
            <div className="flex flex-col gap-2 p-8 text-text-muted">
                <p>Rezept nicht gefunden.</p>
                <Link to="/library" className="text-primary underline">
                    ← Zurück zur Bibliothek
                </Link>
            </div>
        );

    // Fremde Kopie desselben Rezepts ist schon veröffentlicht.
    const inCommunity = !recipe.isPublished && communityUrls.has(recipe.sourceUrl);

    const photoButton =
        'flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-bg/85 px-3 text-sm font-medium text-text hover:bg-bg';

    return (
        <div className="flex min-w-0 w-full max-w-5xl flex-col gap-5 px-5 py-5">
            <div className="flex items-center gap-2">
                <Link
                    to="/library"
                    aria-label="Zurück zur Bibliothek"
                    className={`${iconButton} border-border text-text hover:border-border-strong`}
                >
                    <ArrowLeft size={20} strokeWidth={1.5} aria-hidden />
                </Link>
                <span className="flex-1" />
                <button
                    type="button"
                    onClick={() => setPlanning((v) => !v)}
                    aria-expanded={planning}
                    aria-label="Im Essensplan einplanen"
                    className={`${iconButton} ${
                        planning
                            ? 'border-primary bg-elevated text-primary'
                            : 'border-border text-text hover:border-border-strong'
                    }`}
                >
                    <CalendarDays size={20} strokeWidth={1.5} aria-hidden />
                </button>
                <button
                    type="button"
                    onClick={() => {
                        // Abbrechen stellt den Stand vor dem Bearbeiten wieder her.
                        if (editing && backup) setRecipe(backup);
                        else setBackup(recipe);
                        setEditing(!editing);
                    }}
                    aria-pressed={editing}
                    aria-label={editing ? 'Bearbeiten abbrechen' : 'Bearbeiten'}
                    className={`${iconButton} ${
                        editing
                            ? 'border-primary bg-elevated text-primary'
                            : 'border-border text-text hover:border-border-strong'
                    }`}
                >
                    {editing ? (
                        <X size={20} strokeWidth={1.5} aria-hidden />
                    ) : (
                        <Pencil size={20} strokeWidth={1.5} aria-hidden />
                    )}
                </button>
                <button
                    type="button"
                    onClick={togglePublished}
                    disabled={inCommunity}
                    aria-pressed={!!recipe.isPublished}
                    aria-label={
                        recipe.isPublished
                            ? 'Aus der Community entfernen'
                            : inCommunity
                              ? 'Schon in der Community'
                              : 'In der Community teilen'
                    }
                    title={inCommunity ? 'Schon in der Community' : undefined}
                    className={`${iconButton} disabled:cursor-not-allowed disabled:opacity-40 ${
                        recipe.isPublished
                            ? 'border-primary bg-elevated text-primary'
                            : 'border-border text-text hover:border-border-strong'
                    }`}
                >
                    <Share size={20} strokeWidth={1.5} aria-hidden />
                </button>
                {editing && (
                    <button
                        type="button"
                        onClick={remove}
                        aria-label="Rezept löschen"
                        className={`${iconButton} border-border text-danger hover:border-danger`}
                    >
                        <Trash2 size={20} strokeWidth={1.5} aria-hidden />
                    </button>
                )}
            </div>

            {planning && (
                <form
                    onSubmit={plan}
                    className="flex items-end gap-2 rounded-lg border border-border bg-surface p-3"
                >
                    <label className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="label-mono">Datum</span>
                        <input
                            name="date"
                            type="date"
                            required
                            // Lokales Heute als 'YYYY-MM-DD' (sv-SE formatiert ISO-artig).
                            defaultValue={new Date().toLocaleDateString('sv-SE')}
                            className="h-11 rounded-md border border-border-strong bg-bg px-3 font-mono text-sm text-text outline-none focus:border-primary"
                        />
                    </label>
                    <button
                        type="submit"
                        className="h-11 cursor-pointer rounded-md bg-primary px-4 font-bold text-bg hover:bg-primary-soft"
                    >
                        Einplanen
                    </button>
                </form>
            )}
            {planned && (
                <p role="status" className="text-sm text-text-muted">
                    Eingeplant für {planned} ·{' '}
                    <Link to="/planner" className="text-primary underline">
                        zum Essensplan
                    </Link>
                </p>
            )}
            {recipe.isPublished && (
                <p className="label-mono text-primary">In der Community geteilt</p>
            )}

            {error && (
                <p role="alert" className="text-danger">
                    {error}
                </p>
            )}

            <div className="relative">
                {recipe.imageUrl ? (
                    <img
                        src={recipe.imageUrl}
                        alt=""
                        className="max-h-80 w-full rounded-lg object-cover"
                    />
                ) : (
                    <div className="flex h-44 w-full items-center justify-center rounded-lg bg-elevated text-text-muted">
                        Noch kein Bild
                    </div>
                )}
                <div className="absolute right-3 bottom-3 flex gap-2">
                    {uploading ? (
                        <span className={photoButton}>
                            <LoaderCircle size={16} className="animate-spin" aria-hidden />
                            Lädt hoch…
                        </span>
                    ) : (
                        <>
                            <label className={photoButton}>
                                <ImageIcon size={16} strokeWidth={1.5} aria-hidden />
                                Foto
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={onImage}
                                    className="sr-only"
                                />
                            </label>
                            <label className={photoButton} aria-label="Foto aufnehmen">
                                <Camera size={16} strokeWidth={1.5} aria-hidden />
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={onImage}
                                    className="sr-only"
                                />
                            </label>
                        </>
                    )}
                </div>
            </div>

            {editing ? (
                <RecipePreview
                    recipe={recipe}
                    saving={saving}
                    onChange={setRecipe}
                    onSave={save}
                />
            ) : (
                <RecipeView recipe={recipe}>
                    <div className="flex gap-2">
                        <Link
                            to={`/library/${recipe._id}/cook`}
                            className="flex h-13 flex-1 items-center justify-center gap-2 rounded-md bg-primary font-bold text-bg hover:bg-primary-soft md:flex-none md:px-8"
                        >
                            <ChefHat size={20} aria-hidden />
                            Kochmodus starten
                        </Link>
                        <button
                            type="button"
                            onClick={addIngredients}
                            aria-label="Zutaten auf die Einkaufsliste"
                            title="Zutaten auf die Einkaufsliste"
                            className="flex h-13 cursor-pointer items-center justify-center gap-2 rounded-md border border-border-strong bg-surface px-4 text-text hover:border-primary"
                        >
                            {added ? (
                                <Check size={20} className="text-primary" aria-hidden />
                            ) : (
                                <ShoppingBasket size={20} strokeWidth={1.5} aria-hidden />
                            )}
                            <span className="hidden md:inline">
                                {added ? 'Hinzugefügt' : 'Einkaufsliste'}
                            </span>
                        </button>
                    </div>
                </RecipeView>
            )}
        </div>
    );
};

export default RecipeDetail;
