import { useEffect, useState } from 'react';
import { listCommunity, type Recipe } from '../api/recipes';

const authorName = (userId: Recipe['userId']): string =>
    typeof userId === 'object' && userId?.name ? userId.name : 'Anonymous';

const Community = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        listCommunity()
            .then(setRecipes)
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
    }, []);

    if (loading)
        return <p className="p-8 font-sans text-text-subtle">Loading…</p>;

    return (
        <div className="flex w-full flex-col items-center gap-6 px-4 py-8 font-display">
            <h2 className="text-2xl font-bold text-text">Community Recipes</h2>

            {error && <p className="font-sans text-danger">{error}</p>}
            {recipes.length === 0 && (
                <p className="font-sans text-text-subtle">
                    No published recipes yet.
                </p>
            )}

            {recipes.map((r) => (
                <div
                    key={r._id}
                    className="w-full max-w-2xl rounded-2xl border border-border bg-glass p-6 shadow-card backdrop-blur-md"
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
                </div>
            ))}
        </div>
    );
};

export default Community;
