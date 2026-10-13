import { useState, type ReactNode } from 'react';
import type { Recipe } from '../api/recipes';

// Lesansicht eines Rezepts (Bibliothek + Community): Tabs auf dem Handy, zwei Spalten ab md.
const RecipeView = ({
    recipe,
    byline,
    children,
}: {
    recipe: Recipe;
    byline?: string;
    children?: ReactNode; // Aktionen zwischen Titel und Zutaten
}) => {
    const [tab, setTab] = useState<'ingredients' | 'steps'>('ingredients');

    const meta = [
        byline,
        recipe.category,
        recipe.cookTimeMinutes != null && `${recipe.cookTimeMinutes} min`,
        recipe.servings != null && `${recipe.servings} Port.`,
    ].filter(Boolean);

    const tabClass = (active: boolean) =>
        `-mb-px h-10 cursor-pointer border-b-2 ${
            active
                ? 'border-primary font-medium text-text'
                : 'border-transparent text-text-muted hover:text-text'
        }`;

    return (
        <div className="flex w-full flex-col gap-5">
            <div className="flex flex-col gap-1.5">
                <h1 className="text-3xl leading-tight font-bold tracking-tight">
                    {recipe.title}
                </h1>
                {meta.length > 0 && (
                    <p className="label-mono">{meta.join(' · ')}</p>
                )}
            </div>

            {children}

            <div
                role="tablist"
                className="flex gap-5 border-b border-border md:hidden"
            >
                <button
                    role="tab"
                    aria-selected={tab === 'ingredients'}
                    onClick={() => setTab('ingredients')}
                    className={tabClass(tab === 'ingredients')}
                >
                    Zutaten
                </button>
                <button
                    role="tab"
                    aria-selected={tab === 'steps'}
                    onClick={() => setTab('steps')}
                    className={tabClass(tab === 'steps')}
                >
                    Schritte
                </button>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <section
                    className={`${tab === 'ingredients' ? '' : 'hidden'} md:block`}
                >
                    <h2 className="label-mono mb-2 hidden md:block">Zutaten</h2>
                    <table className="w-full border-collapse">
                        <tbody>
                            {recipe.ingredients.map((ing, i) => (
                                <tr key={i} className="border-b border-border">
                                    <td className="w-24 py-2.5 pr-3 align-top font-mono text-sm text-primary">
                                        {[ing.amount, ing.unit]
                                            .filter((x) => x != null && x !== '')
                                            .join(' ')}
                                    </td>
                                    <td className="py-2.5">{ing.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section className={`${tab === 'steps' ? '' : 'hidden'} md:block`}>
                    <h2 className="label-mono mb-2 hidden md:block">Schritte</h2>
                    <ol className="flex flex-col gap-4">
                        {recipe.instructions.map((step, i) => (
                            <li key={i} className="flex gap-3.5">
                                <span className="pt-0.5 font-mono text-sm text-primary">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="leading-relaxed">{step}</span>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default RecipeView;
