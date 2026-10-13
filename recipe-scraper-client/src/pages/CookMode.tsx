import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, Moon, X } from 'lucide-react';
import { listRecipes, type Recipe } from '../api/recipes';
import { stepIngredients } from '../utils/cook';

const pad = (n: number) => String(n).padStart(2, '0');

// Vollbild-Kochmodus: ein Schritt pro Ansicht, Bildschirm bleibt an.
const CookMode = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [i, setI] = useState(0);
    const [awake, setAwake] = useState(false);

    useEffect(() => {
        listRecipes()
            .then((rs) => setRecipe(rs.find((r) => r._id === id) ?? null))
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
    }, [id]);

    // Screen Wake Lock: nicht überall verfügbar (z. B. ältere Safari) → still weglassen.
    useEffect(() => {
        let lock: WakeLockSentinel | null = null;
        let cancelled = false;
        const request = async () => {
            try {
                const l = await navigator.wakeLock?.request('screen');
                if (cancelled) {
                    l?.release();
                    return;
                }
                lock = l ?? null;
                setAwake(!!lock);
            } catch {
                setAwake(false);
            }
        };
        request();
        // Der Lock fällt beim Tab-Wechsel weg → beim Zurückkommen neu anfordern.
        const onVisible = () => {
            if (document.visibilityState === 'visible') request();
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            cancelled = true;
            document.removeEventListener('visibilitychange', onVisible);
            lock?.release().catch(() => {});
        };
    }, []);

    const back = `/library/${id}`;
    if (loading) return <p className="p-8 text-text-muted">Lädt…</p>;
    if (!recipe || recipe.instructions.length === 0)
        return (
            <div className="flex flex-col gap-2 p-8 text-text-muted">
                <p>{error || 'Dieses Rezept hat keine Schritte.'}</p>
                <Link to={back} className="text-primary underline">
                    ← Zurück zum Rezept
                </Link>
            </div>
        );

    const steps = recipe.instructions;
    const last = i === steps.length - 1;
    const uses = stepIngredients(steps[i], recipe.ingredients);

    return (
        <div className="pb-cook-safe mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-4 px-4 pt-4">
            <div className="flex items-center gap-3">
                <Link
                    to={back}
                    aria-label="Kochmodus verlassen"
                    className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-text hover:border-border-strong"
                >
                    <X size={20} strokeWidth={1.5} aria-hidden />
                </Link>
                <span className="min-w-0 flex-1 truncate font-medium">
                    {recipe.title}
                </span>
                <span className="font-mono text-sm text-text-muted">
                    {pad(i + 1)} / {pad(steps.length)}
                </span>
            </div>

            <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
                aria-hidden
            >
                {steps.map((_, k) => (
                    <span
                        key={k}
                        className={`h-1 rounded-full ${k <= i ? 'bg-primary' : 'bg-border'}`}
                    />
                ))}
            </div>

            <section
                aria-live="polite"
                className="flex flex-1 flex-col gap-5 rounded-xl border border-border bg-surface p-6"
            >
                <span className="label-mono">Schritt</span>
                <span className="text-8xl leading-[0.8] font-bold tracking-tighter text-primary">
                    {pad(i + 1)}
                </span>
                <p className="text-2xl leading-snug font-medium">{steps[i]}</p>
                <span className="flex-1" />
                {uses.length > 0 && (
                    <div className="flex flex-col gap-2 border-t border-border pt-3.5">
                        <span className="label-mono">Für diesen Schritt</span>
                        {uses.map((u, k) => (
                            <div key={k} className="flex gap-3">
                                <span className="w-20 shrink-0 font-mono text-sm text-primary">
                                    {[u.amount, u.unit]
                                        .filter((x) => x != null && x !== '')
                                        .join(' ')}
                                </span>
                                <span>{u.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {awake && (
                <span className="label-mono flex items-center gap-1.5">
                    <Moon size={14} strokeWidth={1.5} aria-hidden />
                    Bildschirm bleibt an
                </span>
            )}

            <div className="grid grid-cols-[1fr_2fr] gap-2.5">
                <button
                    onClick={() => setI((n) => Math.max(0, n - 1))}
                    disabled={i === 0}
                    className="flex h-15 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface font-medium text-text disabled:opacity-40"
                >
                    <ArrowLeft size={20} strokeWidth={1.5} aria-hidden />
                    Zurück
                </button>
                {last ? (
                    <Link
                        to={back}
                        className="flex h-15 items-center justify-center gap-2 rounded-lg bg-primary text-lg font-bold text-bg hover:bg-primary-soft"
                    >
                        Fertig
                    </Link>
                ) : (
                    <button
                        onClick={() => setI((n) => n + 1)}
                        className="flex h-15 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary text-lg font-bold text-bg hover:bg-primary-soft"
                    >
                        Weiter
                        <ArrowRight size={20} aria-hidden />
                    </button>
                )}
            </div>
        </div>
    );
};

export default CookMode;
