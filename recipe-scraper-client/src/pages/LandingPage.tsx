import { useState } from 'react';
import Hero from '../components/Hero';
import { ExtractForm } from '../components/ExtractForm';
import { RecipePreview } from '../components/RecipePreview';
import { extractRecipe, saveRecipe, type Recipe } from '../api/recipes';

const LandingPage = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [recipe, setRecipe] = useState<Recipe | null>(null);

    const handleExtract = async (url: string) => {
        setLoading(true);
        setError('');
        setSaved(false);
        setRecipe(null);
        try {
            setRecipe(await extractRecipe(url));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!recipe) return;
        setSaving(true);
        setError('');
        try {
            await saveRecipe(recipe);
            setSaved(true);
            setRecipe(null);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex w-full flex-col items-center gap-8 px-4 font-display">
            <Hero />
            <ExtractForm loading={loading} onSubmit={handleExtract} />

            {error && <p className="font-sans text-danger">{error}</p>}
            {saved && (
                <p className="font-sans text-success">Rezept gespeichert ✓</p>
            )}

            {recipe && (
                <RecipePreview
                    recipe={recipe}
                    saving={saving}
                    onChange={setRecipe}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default LandingPage;
