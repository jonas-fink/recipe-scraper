import { useState } from 'react';
import { Star } from 'lucide-react';
import { type Recipe } from '../../api/recipes';
import CategoryTabs from '../shared/CategoryTabs';
import SearchBar from '../shared/SearchBar';

type RecipePickerProps = {
    recipes: Recipe[];
    onPick: (recipeId: string) => void;
};

// Durchsuchbare Rezeptliste für den Essensplan (Favoriten zuerst).
const RecipePicker = ({ recipes, onPick }: RecipePickerProps) => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');

    const q = query.trim().toLowerCase();
    const shown = recipes
        .filter(
            (r) =>
                (category === '' || r.category === category) &&
                (q === '' ||
                    r.title.toLowerCase().includes(q) ||
                    (r.category ?? '').toLowerCase().includes(q)),
        )
        .sort((a, b) => Number(!!b.isFavorite) - Number(!!a.isFavorite));

    if (recipes.length === 0)
        return <p className="text-text-muted">Deine Bibliothek ist leer.</p>;

    return (
        <div className="flex min-h-0 flex-col gap-3">
            <SearchBar query={query} onChange={setQuery} />
            <CategoryTabs value={category} onChange={setCategory} />
            <ul className="flex max-h-[45vh] flex-col overflow-y-auto">
                {shown.length === 0 && (
                    <li className="px-2 py-3 text-text-muted">Keine Treffer.</li>
                )}
                {shown.map((r) => (
                    <li key={r._id}>
                        <button
                            type="button"
                            onClick={() => onPick(r._id!)}
                            className="flex w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left hover:bg-elevated"
                        >
                            {r.imageUrl ? (
                                <img
                                    src={r.imageUrl}
                                    alt=""
                                    className="size-12 shrink-0 rounded-sm object-cover"
                                />
                            ) : (
                                <span className="size-12 shrink-0 rounded-sm bg-elevated" />
                            )}
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span className="truncate font-medium">
                                    {r.title}
                                </span>
                                <span className="label-mono truncate">
                                    {[
                                        r.category,
                                        r.servings && `${r.servings} Port.`,
                                        r.cookTimeMinutes &&
                                            `${r.cookTimeMinutes} min`,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </span>
                            </span>
                            {r.isFavorite && (
                                <Star
                                    size={16}
                                    fill="currentColor"
                                    className="shrink-0 text-primary"
                                    aria-label="Favorit"
                                />
                            )}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecipePicker;
