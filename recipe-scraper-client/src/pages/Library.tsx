import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Star } from 'lucide-react';
import {
    listRecipes,
    updateRecipe,
    type Recipe,
    type RecipePatch,
} from '../api/recipes';
import CategoryTabs from '../components/shared/CategoryTabs';
import SearchBar from '../components/shared/SearchBar';
import { ListSkeleton } from '../components/Skeletons';

const Library = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const [activeFilter, setActiveFilter] = useState('');
    const [query, setQuery] = useState('');

    useEffect(() => {
        listRecipes()
            .then(setRecipes)
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
    }, []);

    const patch = async (id: string, patch: RecipePatch) => {
        try {
            const updated = await updateRecipe(id, patch);
            setRecipes((rs) => rs.map((r) => (r._id === id ? updated : r)));
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const q = query.trim().toLowerCase();
    const shown = recipes.filter(
        (r) =>
            (!favoritesOnly || r.isFavorite) &&
            (activeFilter === '' || r.category === activeFilter) &&
            (q === '' ||
                r.title.toLowerCase().includes(q) ||
                (r.category ?? '').toLowerCase().includes(q)),
    );

    return (
        <div className="flex w-full max-w-5xl flex-col gap-4 px-5 py-6">
            <div className="flex items-center gap-2">
                <h1 className="min-w-0 flex-1 text-2xl font-bold tracking-tight md:text-3xl">
                    Bibliothek
                </h1>
                <button
                    onClick={() => setFavoritesOnly((v) => !v)}
                    aria-pressed={favoritesOnly}
                    aria-label="Nur Favoriten"
                    className={`flex size-11 cursor-pointer items-center justify-center rounded-md ${
                        favoritesOnly
                            ? 'bg-primary text-bg'
                            : 'border border-border bg-surface text-text hover:border-border-strong'
                    }`}
                >
                    <Star
                        size={20}
                        strokeWidth={1.5}
                        fill={favoritesOnly ? 'currentColor' : 'none'}
                        aria-hidden
                    />
                </button>
            </div>

            <SearchBar query={query} onChange={setQuery} />
            <CategoryTabs value={activeFilter} onChange={setActiveFilter} />

            {error && (
                <p role="alert" className="text-danger">
                    {error}
                </p>
            )}
            {!loading && shown.length === 0 && (
                <p className="text-text-muted">
                    {recipes.length === 0
                        ? 'Noch keine Rezepte — füge oben über das Link-Symbol einen Link ein.'
                        : 'Keine Treffer.'}
                </p>
            )}

            {loading ? (
                <ListSkeleton />
            ) : (
                <ul className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                    {shown.map((r) => (
                        <li
                            key={r._id}
                            className="flex items-center gap-3.5 border-b border-border py-2.5"
                        >
                            <Link
                                to={`/library/${r._id}`}
                                className="group flex min-w-0 flex-1 items-center gap-3.5 text-text"
                            >
                                {r.imageUrl ? (
                                    <img
                                        src={r.imageUrl}
                                        alt=""
                                        className="size-16 shrink-0 rounded-md object-cover"
                                    />
                                ) : (
                                    <span className="size-16 shrink-0 rounded-md bg-elevated" />
                                )}
                                <span className="flex min-w-0 flex-col gap-1">
                                    <span className="truncate font-medium group-hover:text-primary">
                                        {r.title}
                                    </span>
                                    <span className="label-mono truncate">
                                        {[
                                            r.category,
                                            r.cookTimeMinutes != null &&
                                                `${r.cookTimeMinutes} min`,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </span>
                                </span>
                            </Link>
                            <button
                                onClick={() =>
                                    patch(r._id!, { isFavorite: !r.isFavorite })
                                }
                                aria-pressed={!!r.isFavorite}
                                aria-label={`${r.title} als Favorit markieren`}
                                className={`flex size-11 shrink-0 cursor-pointer items-center justify-center ${
                                    r.isFavorite
                                        ? 'text-primary'
                                        : 'text-text-subtle hover:text-text'
                                }`}
                            >
                                <Star
                                    size={20}
                                    strokeWidth={1.5}
                                    fill={r.isFavorite ? 'currentColor' : 'none'}
                                    aria-hidden
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Library;
