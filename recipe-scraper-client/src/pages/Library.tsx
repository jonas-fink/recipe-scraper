import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
    listRecipes,
    listCommunity,
    updateRecipe,
    FOOD_CATEGORIES,
    type Recipe,
    type RecipePatch,
} from '../api/recipes';
import { Pill } from '../components/hero/Pill';
import FilterButton from '../components/library/FilterButton';
import SearchBar from '../components/shared/SearchBar';
import { AiOutlineStar, AiFillStar } from 'react-icons/ai';

const Library = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const [activeFilter, setActiveFilter] = useState('');
    const [query, setQuery] = useState('');
    const [communityUrls, setCommunityUrls] = useState<Set<string>>(new Set());

    useEffect(() => {
        listRecipes()
            .then(setRecipes)
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
        // Source URLs already in the community — used to block duplicate publishing.
        listCommunity()
            .then((rs) => setCommunityUrls(new Set(rs.map((r) => r.sourceUrl))))
            .catch(() => {});
    }, []);

    const patch = async (id: string, patch: RecipePatch) => {
        const updated = await updateRecipe(id, patch);
        setRecipes((rs) => rs.map((r) => (r._id === id ? updated : r)));
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

    if (loading)
        return <p className="p-8 font-sans text-text-subtle">Loading…</p>;

    return (
        <div className="flex w-full flex-col items-center gap-6 px-4 py-8 font-display">
            <div className="flex gap-4 w-full justify-center items-center">
                {' '}
                <SearchBar query={query} onChange={setQuery} />{' '}
                <button
                    onClick={() => setFavoritesOnly((v) => !v)}
                    aria-pressed={favoritesOnly}
                    className={`p-2 rounded-full cursor-pointer hover:brightness-110 ${
                        favoritesOnly
                            ? 'bg-gradient-brand text-black'
                            : 'bg-elevated'
                    }`}
                >
                    {favoritesOnly ? (
                        <AiFillStar size={24} />
                    ) : (
                        <AiOutlineStar size={24} />
                    )}
                </button>
            </div>

            <div className="flex flex-col w-full max-w-6xl items-center justify-between gap-4">
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
            </div>
            {error && <p className="font-sans text-danger">{error}</p>}
            {shown.length === 0 && (
                <p className="font-sans text-text-subtle">No recipes yet.</p>
            )}
            <div className="grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((r) => (
                    <div
                        key={r._id}
                        className="flex flex-col overflow-hidden rounded-2xl border border-border bg-glass shadow-card backdrop-blur-md"
                    >
                        <Link
                            to={`/library/${r._id}`}
                            style={
                                r.imageUrl
                                    ? { backgroundImage: `url(${r.imageUrl})` }
                                    : undefined
                            }
                            className={`relative block aspect-video bg-cover bg-center ${
                                r.imageUrl ? '' : 'bg-gradient-brand'
                            }`}
                        >
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    patch(r._id!, {
                                        isFavorite: !r.isFavorite,
                                    });
                                }}
                                title="Toggle favorite"
                                className="absolute right-2 top-2 text-2xl leading-none drop-shadow-lg cursor-pointer"
                            >
                                {r.isFavorite ? (
                                    <AiFillStar size={32} />
                                ) : (
                                    <AiOutlineStar size={32} />
                                )}
                            </button>
                            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-4">
                                <h3 className="text-xl font-semibold text-white drop-shadow">
                                    {r.title}
                                </h3>
                            </div>
                        </Link>

                        <div className="flex flex-col gap-3 p-4 font-sans  items-start">
                            <Pill>{r.category ?? ''}</Pill>
                            {(() => {
                                const inCommunity =
                                    !r.isPublished &&
                                    communityUrls.has(r.sourceUrl);
                                return (
                                    <button
                                        onClick={() =>
                                            patch(r._id!, {
                                                isPublished: !r.isPublished,
                                            })
                                        }
                                        disabled={inCommunity}
                                        className="self-end rounded-full bg-gradient-brand px-5 py-2 font-semibold text-bg cursor-pointer hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {r.isPublished
                                            ? 'Unpublish'
                                            : inCommunity
                                              ? 'Already in community'
                                              : 'Publish to community'}
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                ))}
            </div>
            <datalist id="food-categories">
                {FOOD_CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                ))}
            </datalist>
        </div>
    );
};

export default Library;
