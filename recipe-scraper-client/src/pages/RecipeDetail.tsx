import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { RecipePreview } from '../components/RecipePreview';
import {
    listRecipes,
    updateRecipe,
    uploadRecipeImage,
    type Recipe,
} from '../api/recipes';

const RecipeDetail = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // ponytail: reuse listRecipes() instead of a GET /:id route — personal library is small
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
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSaving(false);
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
                <Link to="/library" className="text-mint hover:underline">
                    ← Back to library
                </Link>
                <label className="cursor-pointer rounded-full bg-gradient-brand px-5 py-2 font-semibold text-bg hover:brightness-110">
                    {uploading ? 'Uploading…' : 'Bild hochladen'}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onImage}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
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

            <RecipePreview
                recipe={recipe}
                saving={saving}
                onChange={setRecipe}
                onSave={save}
            />
        </div>
    );
};

export default RecipeDetail;
