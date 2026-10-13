import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { listCommunity, type Recipe } from '../api/recipes';
import SearchBar from '../components/shared/SearchBar';
import CategoryTabs from '../components/shared/CategoryTabs';
import { ListSkeleton } from '../components/Skeletons';

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

    const q = query.trim().toLowerCase();
    const shown = recipes.filter(
        (r) =>
            (activeFilter === '' || r.category === activeFilter) &&
            (q === '' ||
                r.title.toLowerCase().includes(q) ||
                (r.category ?? '').toLowerCase().includes(q)),
    );

    return (
        <div className="flex min-w-0 w-full max-w-6xl flex-col gap-4 px-5 py-6">
            <h1 className="text-3xl font-bold tracking-tight">Community</h1>
            <SearchBar query={query} onChange={setQuery} />
            <CategoryTabs value={activeFilter} onChange={setActiveFilter} />

            {error && (
                <p role="alert" className="text-danger">
                    {error}
                </p>
            )}
            {!loading && shown.length === 0 && (
                <p className="text-text-muted">
                    Noch keine veröffentlichten Rezepte.
                </p>
            )}

            {loading ? (
                <ListSkeleton />
            ) : (
                <div className="grid grid-cols-2 gap-x-3 gap-y-5 lg:grid-cols-4">
                    {shown.map((r) => (
                        <Link
                            key={r._id}
                            to={`/community/${r._id}`}
                            className="group flex min-w-0 flex-col gap-2 text-text"
                        >
                            {r.imageUrl ? (
                                <img
                                    src={r.imageUrl}
                                    alt=""
                                    className="aspect-4/3 w-full rounded-lg object-cover group-hover:brightness-110"
                                />
                            ) : (
                                <div className="aspect-4/3 w-full rounded-lg bg-elevated" />
                            )}
                            <span className="font-medium group-hover:text-primary">
                                {r.title}
                            </span>
                            <span className="label-mono truncate">
                                {[r.category, `von ${authorName(r.userId)}`]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Community;
