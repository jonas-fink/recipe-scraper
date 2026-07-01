import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { listCommunity, type Recipe, FOOD_CATEGORIES } from '../api/recipes';
import SearchBar from '../components/shared/SearchBar';
import FilterButton from '../components/library/FilterButton';

const authorName = (userId: Recipe['userId']): string =>
    typeof userId === 'object' && userId?.name ? userId.name : 'Anonymous';

const Community = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('');

    useEffect(() => {
        listCommunity()
            .then(setRecipes)
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
    }, []);

    if (loading)
        return <p className="p-8 font-sans text-text-subtle">Loading…</p>;

    const q = query.trim().toLowerCase();
    const shown = recipes.filter(
        (r) =>
            (activeFilter === '' || r.category === activeFilter) &&
            (q === '' ||
                r.title.toLowerCase().includes(q) ||
                (r.category ?? '').toLowerCase().includes(q)),
    );

    return (
        <div className="flex w-full flex-col items-center gap-6 px-4 py-8 font-display max-w-6xl">
            <SearchBar query={query} onChange={setQuery} />

            <div className="flex w-full gap-2 flex-nowrap overflow-x-auto scroll-smooth">
                <FilterButton
                    name="All"
                    isActive={activeFilter === ''}
                    onSelect={() => setActiveFilter('')}
                />
                {FOOD_CATEGORIES.map((c) => (
                    <FilterButton
                        key={c}
                        name={c}
                        isActive={activeFilter === c}
                        onSelect={() => setActiveFilter(c)}
                    />
                ))}
            </div>

            {error && <p className="font-sans text-danger">{error}</p>}
            {shown.length === 0 && (
                <p className="font-sans text-text-subtle">
                    No published recipes yet.
                </p>
            )}

            <div className="grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((r) => (
                    <Link
                        key={r._id}
                        to={`/community/${r._id}`}
                        className="flex flex-col overflow-hidden rounded-2xl border border-border bg-glass shadow-card backdrop-blur-md transition hover:brightness-110"
                    >
                        <div
                            style={
                                r.imageUrl
                                    ? { backgroundImage: `url(${r.imageUrl})` }
                                    : undefined
                            }
                            className={`relative block aspect-video bg-cover bg-center ${
                                r.imageUrl ? '' : 'bg-gradient-brand'
                            }`}
                        >
                            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-4">
                                <h3 className="text-xl font-semibold text-white drop-shadow">
                                    {r.title}
                                </h3>
                            </div>
                        </div>

                        <div className="flex items-baseline justify-between gap-4 p-4 font-sans">
                            {r.category && (
                                <span className="text-sm text-text-subtle">
                                    {r.category}
                                </span>
                            )}
                            <span className="ml-auto text-sm text-text-subtle">
                                by {authorName(r.userId)}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Community;
