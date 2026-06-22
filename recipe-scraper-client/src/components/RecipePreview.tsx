import type { Recipe, Ingredient } from '../api/recipes';

const card =
    'w-full max-w-2xl rounded-2xl border border-border bg-glass p-6 backdrop-blur-md shadow-card';
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
        <div className={card}>
            <input
                value={recipe.title}
                onChange={(e) => onChange({ ...recipe, title: e.target.value })}
                className={`${field} mb-5 w-full text-2xl font-display`}
            />

            <h3 className="mb-2 font-semibold text-text-muted">Zutaten</h3>
            <div className="mb-5 flex flex-col gap-2">
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
                            className={`${field} w-24`}
                        />
                        <input
                            value={ing.unit ?? ''}
                            placeholder="Einheit"
                            onChange={(e) =>
                                setIngredient(i, {
                                    unit: e.target.value || null,
                                })
                            }
                            className={`${field} w-28`}
                        />
                        <input
                            value={ing.name}
                            placeholder="Zutat"
                            onChange={(e) =>
                                setIngredient(i, { name: e.target.value })
                            }
                            className={`${field} flex-1`}
                        />
                        <button
                            type="button"
                            onClick={() => removeIngredient(i)}
                            className="px-2 text-text-subtle hover:text-danger"
                            aria-label="Zutat entfernen"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <h3 className="mb-2 font-semibold text-text-muted">Schritte</h3>
            <ol className="mb-6 flex flex-col gap-2">
                {recipe.instructions.map((step, i) => (
                    <li key={i} className="flex gap-2">
                        <span className="pt-2 text-text-subtle">{i + 1}.</span>
                        <textarea
                            value={step}
                            rows={2}
                            onChange={(e) => setStep(i, e.target.value)}
                            className={`${field} flex-1 resize-y`}
                        />
                        <button
                            type="button"
                            onClick={() => removeStep(i)}
                            className="px-2 text-text-subtle hover:text-danger"
                            aria-label="Schritt entfernen"
                        >
                            ✕
                        </button>
                    </li>
                ))}
            </ol>

            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="rounded-full bg-gradient-brand px-6 py-3 font-semibold text-bg disabled:opacity-50"
                >
                    {saving ? 'Speichere…' : 'Rezept speichern'}
                </button>
            </div>
        </div>
    );
}
