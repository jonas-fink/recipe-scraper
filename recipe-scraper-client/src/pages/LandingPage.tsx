import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { LoaderCircle } from 'lucide-react';
import Hero from '../components/Hero';
import { ExtractForm } from '../components/ExtractForm';
import { RecipePreview } from '../components/RecipePreview';
import {
    extractRecipe,
    saveRecipe,
    stripBlankRows,
    type Recipe,
} from '../api/recipes';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const urlParam = params.get('url');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [source, setSource] = useState('');
    const lastUrl = useRef(''); // StrictMode ruft Effekte doppelt auf → nicht zweimal extrahieren

    const handleExtract = async (url: string) => {
        setLoading(true);
        setError('');
        setRecipe(null);
        setSource(url);
        try {
            setRecipe(await extractRecipe(url));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // Link aus dem Dock (?url=…) übernehmen, Parameter danach entfernen.
    useEffect(() => {
        if (!urlParam || urlParam === lastUrl.current) return;
        lastUrl.current = urlParam;
        handleExtract(urlParam);
        setParams({}, { replace: true });
    }, [urlParam, setParams]);

    const handleSave = async () => {
        if (!recipe) return;
        if (!user) {
            navigate('/login');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const saved = await saveRecipe(stripBlankRows(recipe));
            navigate(saved._id ? `/library/${saved._id}` : '/library');
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSaving(false);
        }
    };

    // Eingeloggt ohne laufende Extraktion: Startseite ist die Bibliothek.
    if (user && !urlParam && !source) return <Navigate to="/library" replace />;

    return (
        <div className="flex min-w-0 w-full max-w-5xl flex-col items-center gap-8 px-4 py-8">
            {!user && <Hero />}
            {!user && <ExtractForm loading={loading} onSubmit={handleExtract} />}

            {user && (
                <div className="flex w-full max-w-3xl flex-col gap-1">
                    <h1 className="text-2xl font-bold">Prüfen &amp; speichern</h1>
                    <p className="truncate font-mono text-xs text-text-muted">
                        {source}
                    </p>
                </div>
            )}

            {user && loading && (
                <p className="flex items-center gap-2 text-text-muted">
                    <LoaderCircle
                        size={20}
                        className="animate-spin text-primary"
                        aria-hidden
                    />
                    Rezept wird extrahiert…
                </p>
            )}
            {error && (
                <p role="alert" className="text-danger">
                    {error}
                </p>
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
