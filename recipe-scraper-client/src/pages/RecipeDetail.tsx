import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { RecipePreview } from '../components/RecipePreview';
import {
    listRecipes,
    updateRecipe,
    deleteRecipe,
    uploadRecipeImage,
    type Recipe,
} from '../api/recipes';
import { addToCart } from '../api/cart';
import {
    RiArrowLeftLine,
    RiCameraLine,
    RiDeleteBinLine,
    RiImageLine,
    RiShoppingCartLine,
} from 'react-icons/ri';
import { PuffLoader } from 'react-spinners';

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

    useEffect(() => {
        listRecipes()
            .then((rs) => setRecipe(rs.find((r) => r._id === id) ?? null))
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
    }, [id]);

    const save = async () => {
        if (!recipe?._id) return;
        setSaving(true);
        try {
            setRecipe(await updateRecipe(recipe._id, recipe));
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

    if (loading)
        return <p className="p-8 font-sans text-text-subtle">Loading…</p>;
    if (!recipe)
        return (
            <div className="p-8 font-sans text-text-subtle">
                <p>Recipe not found.</p>
                <Link to="/library" className="text-mint underline">
                    ← Back to library
                </Link>
            </div>
        );

    return (
        <div className="flex w-full flex-col items-center gap-6 px-4 py-8">
            <div className="flex w-full max-w-5xl items-center justify-between font-sans">
                <Link
                    to="/library"
                    className="text-text-muted hover:text-primary"
                >
                    <RiArrowLeftLine size={24} />
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={addIngredients}
                        title="Zutaten zur Einkaufsliste hinzufügen"
                        className="flex cursor-pointer items-center gap-2 rounded-full bg-gradient-brand p-2 font-semibold text-bg hover:brightness-110"
                    >
                        <RiShoppingCartLine size={32} />
                        {added && <span className="pr-1 text-sm">✓</span>}
                    </button>
                    <label className="flex cursor-pointer justify-center items-center gap-2 rounded-full bg-gradient-brand p-2 font-semibold text-bg hover:brightness-110">
                        {uploading ? (
                            <PuffLoader size={50} />
                        ) : (
                            <RiImageLine size={32} />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onImage}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-full bg-gradient-brand p-2 font-semibold text-bg hover:brightness-110">
                        <RiCameraLine size={32} />

                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={onImage}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>
                    {editing && (
                        <button
                            type="button"
                            onClick={remove}
                            className="flex cursor-pointer items-center gap-2 rounded-full bg-danger p-2 font-semibold text-bg hover:brightness-110"
                        >
                            <RiDeleteBinLine size={32} />
                        </button>
                    )}
                </div>
            </div>

            {error && <p className="font-sans text-danger">{error}</p>}

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

            {editing ? (
                <RecipePreview
                    recipe={recipe}
                    saving={saving}
                    onChange={setRecipe}
                    onSave={save}
                />
            ) : (
                <div className="w-full max-w-5xl rounded-2xl border border-border bg-glass p-6 shadow-card backdrop-blur-md">
                    <h1 className="text-2xl font-semibold text-text">
                        {recipe.title}
                    </h1>

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

                    <div className="mt-6 flex justify-center">
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            className="rounded-full bg-gradient-brand px-6 py-3 font-semibold text-bg hover:brightness-110 cursor-pointer"
                        >
                            Bearbeiten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeDetail;
