import { AiOutlineClockCircle, AiOutlineMenu } from 'react-icons/ai';
import { FOOD_CATEGORIES, type Recipe, type Ingredient } from '../api/recipes';

const field =
    'rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-border-strong';

export function RecipePreview({
    recipe,
    saving,
    onChange,
    onSave,
}: {
    recipe: Recipe;
    saving: boolean;
    onChange: (r: Recipe) => void;
    onSave: () => void;
}) {
    const setIngredient = (i: number, patch: Partial<Ingredient>) =>
        onChange({
            ...recipe,
            ingredients: recipe.ingredients.map((ing, idx) =>
                idx === i ? { ...ing, ...patch } : ing,
            ),
        });

    const setStep = (i: number, value: string) =>
        onChange({
            ...recipe,
            instructions: recipe.instructions.map((s, idx) =>
                idx === i ? value : s,
            ),
        });

    const removeIngredient = (i: number) =>
        onChange({
            ...recipe,
            ingredients: recipe.ingredients.filter((_, idx) => idx !== i),
        });

    const removeStep = (i: number) =>
        onChange({
            ...recipe,
            instructions: recipe.instructions.filter((_, idx) => idx !== i),
        });

    return (
        <div className="w-full max-w-5xl rounded-2xl border border-border bg-glass p-4 md:p-6 backdrop-blur-md shadow-card mb-16">
            <input
                value={recipe.title}
                onChange={(e) => onChange({ ...recipe, title: e.target.value })}
                className={`${field} mb-5 w-full text-2xl font-display`}
            />
            <div className="mb-5 flex flex-wrap gap-8 justify-center items-center">
                <div className="flex gap-2 items-center">
                    {' '}
                    <AiOutlineClockCircle className="text-mint" />
                    <p className="text-text-muted">
                        Total{' '}
                        <span className="text-white">
                            {recipe.cookTimeMinutes ?? ''} min
                        </span>
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    {' '}
                    <AiOutlineMenu className="text-text-muted" />
                    <p className="text-text-muted">
                        Steps:{' '}
                        <span className="text-white">
                            {recipe.instructions.length}
                        </span>
                    </p>
                </div>

                <select
                    value={recipe.category ?? ''}
                    onChange={(e) =>
                        onChange({
                            ...recipe,
                            category: e.target.value || null,
                        })
                    }
                    className={`${field} flex-1 max-w-1/6 min-w-40`}
                >
                    <option value="">Kategorie …</option>
                    {FOOD_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
                <input
                    value={recipe.servings ?? ''}
                    type="number"
                    placeholder="Portionen"
                    onChange={(e) =>
                        onChange({
                            ...recipe,
                            servings:
                                e.target.value === ''
                                    ? null
                                    : Number(e.target.value),
                        })
                    }
                    className={`${field} w-32`}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-5 flex flex-col gap-2">
                    <h3 className="mb-2 font-semibold text-text-muted">
                        ZUTATEN
                    </h3>
                    {recipe.ingredients.map((ing, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                value={ing.amount ?? ''}
                                type="number"
                                placeholder="Menge"
                                onChange={(e) =>
                                    setIngredient(i, {
                                        amount:
                                            e.target.value === ''
                                                ? null
                                                : Number(e.target.value),
                                    })
                                }
                                className={`${field} w-16 shrink-0`}
                            />
                            <input
                                value={ing.unit ?? ''}
                                placeholder="Unit"
                                onChange={(e) =>
                                    setIngredient(i, {
                                        unit: e.target.value || null,
                                    })
                                }
                                className={`${field} w-14 shrink-0`}
                            />
                            <input
                                value={ing.name}
                                placeholder="Zutat"
                                onChange={(e) =>
                                    setIngredient(i, { name: e.target.value })
                                }
                                className={`${field} min-w-0 flex-1`}
                            />
                            <button
                                type="button"
                                onClick={() => removeIngredient(i)}
                                className="px-2 text-text-subtle hover:text-danger cursor-pointer"
                                aria-label="Zutat entfernen"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="mb-2 font-semibold text-text-muted">
                        SCHRITTE
                    </h3>
                    <ol className="mb-6 flex flex-col gap-2">
                        {recipe.instructions.map((step, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="pt-2 text-text-subtle w-8">
                                    {i + 1}.
                                </span>
                                <textarea
                                    value={step}
                                    rows={2}
                                    onChange={(e) => setStep(i, e.target.value)}
                                    className={`${field} min-w-0 flex-1 resize-y field-sizing-content`}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeStep(i)}
                                    className="px-2 text-text-subtle hover:text-danger cursor-pointer"
                                    aria-label="Schritt entfernen"
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="rounded-full bg-gradient-brand px-6 py-3 font-semibold text-bg disabled:opacity-50 cursor-pointer hover:brightness-110"
                >
                    {saving ? 'Speichere…' : 'Rezept speichern'}
                </button>
            </div>
        </div>
    );
}
