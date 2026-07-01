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

            <div className="flex gap-2">
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

            {shown.map((r) => (
                <Link
                    key={r._id}
                    to={`/community/${r._id}`}
                    className="w-full max-w-2xl rounded-2xl border border-border bg-glass p-6 shadow-card backdrop-blur-md transition hover:brightness-110"
                >
                    <div className="flex items-baseline justify-between gap-4">
                        <h3 className="text-lg font-semibold text-text">
                            {r.title}
                        </h3>
                        <span className="font-sans text-sm text-text-subtle">
                            by {authorName(r.userId)}
                        </span>
                    </div>
                    {r.category && (
                        <span className="mt-1 inline-block font-sans text-sm text-text-subtle">
                            {r.category}
                        </span>
                    )}
                    {r.imageUrl && (
                        <img
                            src={r.imageUrl}
                            alt={r.title}
                            className="mt-3 max-h-48 w-full rounded-md object-cover"
                        />
                    )}
                </Link>
            ))}
        </div>
    );
};

export default Community;
