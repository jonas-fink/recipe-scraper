import { Check, Plus, X } from 'lucide-react';
import { FOOD_CATEGORIES, type Recipe, type Ingredient } from '../api/recipes';

const field =
    'h-11 rounded-md border border-border-strong bg-surface px-3 text-text outline-none focus:border-primary';

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

    const removeIngredient = (i: number) => {
        if (!window.confirm('Willst du diese Zutat löschen?')) return;
        onChange({
            ...recipe,
            ingredients: recipe.ingredients.filter((_, idx) => idx !== i),
        });
    };

    const removeStep = (i: number) => {
        if (!window.confirm('Willst du diesen Schritt löschen?')) return;
        onChange({
            ...recipe,
            instructions: recipe.instructions.filter((_, idx) => idx !== i),
        });
    };

    const addIngredient = () =>
        onChange({
            ...recipe,
            ingredients: [
                ...recipe.ingredients,
                { name: '', amount: null, unit: null },
            ],
        });

    const addStep = () =>
        onChange({ ...recipe, instructions: [...recipe.instructions, ''] });

    // Menge fehlt bei einer benannten Zutat → gelb markieren (KI hat sie nicht erkannt).
    const missingAmount = (ing: Ingredient) =>
        ing.amount == null && ing.name.trim() !== '';

    const addRowButton = (onClick: () => void, label: string) => (
        <button
            type="button"
            onClick={onClick}
            className="flex h-8 cursor-pointer items-center gap-1 rounded-sm border border-border-strong px-2.5 text-sm text-primary hover:bg-elevated"
        >
            <Plus size={14} strokeWidth={1.5} aria-hidden />
            {label}
        </button>
    );

    return (
        <div className="flex w-full max-w-3xl flex-col gap-6 rounded-xl border border-border bg-surface p-4 md:p-6">
            <label className="flex flex-col gap-1.5">
                <span className="label-mono">Titel</span>
                <input
                    value={recipe.title}
                    onChange={(e) =>
                        onChange({ ...recipe, title: e.target.value })
                    }
                    className={`${field} text-lg font-medium`}
                />
            </label>

            <div className="grid grid-cols-3 gap-2">
                <label className="flex min-w-0 flex-col gap-1.5">
                    <span className="label-mono">Min</span>
                    <input
                        value={recipe.cookTimeMinutes ?? ''}
                        type="number"
                        inputMode="numeric"
                        onChange={(e) =>
                            onChange({
                                ...recipe,
                                cookTimeMinutes:
                                    e.target.value === ''
                                        ? null
                                        : Number(e.target.value),
                            })
                        }
                        className={`${field} min-w-0 font-mono`}
                    />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                    <span className="label-mono">Portionen</span>
                    <input
                        value={recipe.servings ?? ''}
                        type="number"
                        inputMode="numeric"
                        onChange={(e) =>
                            onChange({
                                ...recipe,
                                servings:
                                    e.target.value === ''
                                        ? null
                                        : Number(e.target.value),
                            })
                        }
                        className={`${field} min-w-0 font-mono`}
                    />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                    <span className="label-mono">Kategorie</span>
                    <select
                        value={recipe.category ?? ''}
                        onChange={(e) =>
                            onChange({
                                ...recipe,
                                category: e.target.value || null,
                            })
                        }
                        className={`${field} min-w-0 px-2`}
                    >
                        <option value="">—</option>
                        {FOOD_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <section className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="label-mono">
                            Zutaten · {recipe.ingredients.length}
                        </h3>
                        {addRowButton(addIngredient, 'Zeile')}
                    </div>
                    {recipe.ingredients.map((ing, i) => (
                        <div key={i} className="flex gap-1.5">
                            <input
                                value={ing.amount ?? ''}
                                type="number"
                                placeholder="—"
                                aria-label="Menge"
                                onChange={(e) =>
                                    setIngredient(i, {
                                        amount:
                                            e.target.value === ''
                                                ? null
                                                : Number(e.target.value),
                                    })
                                }
                                className={`${field} h-10 w-16 shrink-0 px-2 font-mono text-sm text-primary ${
                                    missingAmount(ing) ? 'border-warning' : ''
                                }`}
                            />
                            <input
                                value={ing.unit ?? ''}
                                placeholder="—"
                                aria-label="Einheit"
                                onChange={(e) =>
                                    setIngredient(i, {
                                        unit: e.target.value || null,
                                    })
                                }
                                className={`${field} h-10 w-16 shrink-0 px-2 font-mono text-sm text-primary`}
                            />
                            <input
                                value={ing.name}
                                placeholder="Zutat"
                                aria-label="Zutat"
                                onChange={(e) =>
                                    setIngredient(i, { name: e.target.value })
                                }
                                className={`${field} h-10 min-w-0 flex-1`}
                            />
                            <button
                                type="button"
                                onClick={() => removeIngredient(i)}
                                className="flex w-9 shrink-0 cursor-pointer items-center justify-center text-text-muted hover:text-danger"
                                aria-label="Zutat entfernen"
                            >
                                <X size={18} strokeWidth={1.5} aria-hidden />
                            </button>
                        </div>
                    ))}
                    {recipe.ingredients.some(missingAmount) && (
                        <p className="font-mono text-xs text-warning">
                            Menge nicht erkannt — bitte ergänzen
                        </p>
                    )}
                </section>

                <section className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="label-mono">
                            Schritte · {recipe.instructions.length}
                        </h3>
                        {addRowButton(addStep, 'Schritt')}
                    </div>
                    <ol className="flex flex-col gap-2">
                        {recipe.instructions.map((step, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="w-6 shrink-0 pt-2.5 font-mono text-sm text-primary">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <textarea
                                    value={step}
                                    rows={2}
                                    aria-label={`Schritt ${i + 1}`}
                                    onChange={(e) => setStep(i, e.target.value)}
                                    className={`${field} field-sizing-content h-auto min-w-0 flex-1 resize-y py-2`}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeStep(i)}
                                    className="flex w-9 shrink-0 cursor-pointer items-center justify-center text-text-muted hover:text-danger"
                                    aria-label="Schritt entfernen"
                                >
                                    <X size={18} strokeWidth={1.5} aria-hidden />
                                </button>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>

            <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="flex h-13 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary font-bold text-bg hover:bg-primary-soft disabled:opacity-50"
            >
                <Check size={20} aria-hidden />
                {saving ? 'Speichere…' : 'Rezept speichern'}
            </button>
        </div>
    );
}
