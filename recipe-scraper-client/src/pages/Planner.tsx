import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    ShoppingBasket,
    X,
} from 'lucide-react';
import {
    addMeal,
    getMealPlan,
    removeMeal,
    updateMeal,
    type MealPlanEntry,
} from '../api/mealPlan';
import { listRecipes, type Recipe } from '../api/recipes';
import { addToCart } from '../api/cart';
import RecipePicker from '../components/planner/RecipePicker';

// Lokales Datum als 'YYYY-MM-DD' — bewusst kein toISOString() (UTC-Verschiebung).
const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const addDays = (d: Date, n: number) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

// Zutaten auf die geplanten Portionen umrechnen (ohne Rezept-Portionen: unverändert).
const scaledIngredients = (e: MealPlanEntry) => {
    const base = e.recipeId.servings;
    const factor = e.servings && base ? e.servings / base : 1;
    return e.recipeId.ingredients.map((i) => ({
        ...i,
        amount:
            i.amount == null ? null : Math.round(i.amount * factor * 100) / 100,
    }));
};

const Planner = () => {
    const [view, setView] = useState<'week' | 'month'>('week');
    const [anchor, setAnchor] = useState(() => new Date());
    const [entries, setEntries] = useState<MealPlanEntry[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [addDate, setAddDate] = useState('');
    const [pickerKey, setPickerKey] = useState(0); // neu mounten = Suche zurücksetzen
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const modalRef = useRef<HTMLDialogElement>(null);

    // Monat: volle Wochen (Mo–So) vom 1. bis zum Monatsletzten.
    const first =
        view === 'week'
            ? mondayOf(anchor)
            : mondayOf(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
    const last =
        view === 'week'
            ? addDays(first, 6)
            : addDays(
                  mondayOf(
                      new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0),
                  ),
                  6,
              );
    const days: Date[] = [];
    for (let d = first; d <= last; d = addDays(d, 1)) days.push(d);
    const from = ymd(first);
    const to = ymd(last);
    const today = ymd(new Date());
    const monthPrefix = ymd(anchor).slice(0, 7);
    // Warenkorb: in der Monatsansicht nur Tage des Monats, nicht die Randtage.
    const inScope =
        view === 'week'
            ? entries
            : entries.filter((e) => e.date.startsWith(monthPrefix));

    useEffect(() => {
        getMealPlan(from, to)
            .then(setEntries)
            .catch((e) => setError((e as Error).message));
    }, [from, to]);

    useEffect(() => {
        listRecipes()
            .then(setRecipes)
            .catch((e) => setError((e as Error).message));
    }, []);

    const step = (n: number) =>
        setAnchor(
            view === 'week'
                ? addDays(anchor, 7 * n)
                : new Date(anchor.getFullYear(), anchor.getMonth() + n, 1),
        );

    const openAdd = (date: string) => {
        setAddDate(date);
        setPickerKey((k) => k + 1);
        modalRef.current?.showModal();
    };

    // Portionen = wie im Rezept; anpassen danach in der Wochenansicht.
    const pick = async (recipeId: string) => {
        modalRef.current?.close();
        try {
            const entry = await addMeal(addDate, recipeId, null);
            setEntries((prev) => [...prev, entry]);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const changeServings = async (entry: MealPlanEntry, value: string) => {
        const servings = Number(value) || null;
        if (servings === entry.servings) return;
        try {
            const updated = await updateMeal(entry._id, servings);
            setEntries((prev) =>
                prev.map((e) => (e._id === entry._id ? updated : e)),
            );
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const remove = async (id: string) => {
        try {
            await removeMeal(id);
            setEntries((prev) => prev.filter((e) => e._id !== id));
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const toCart = async () => {
        try {
            await addToCart(inScope.flatMap(scaledIngredients));
            setInfo('Zutaten auf die Einkaufsliste gesetzt.');
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const fmt = (d: Date) =>
        d.toLocaleDateString('de-DE', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
        });

    const title =
        view === 'week'
            ? `${fmt(first)} – ${fmt(last)}`
            : anchor.toLocaleDateString('de-DE', {
                  month: 'long',
                  year: 'numeric',
              });

    const iconButton =
        'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-surface text-text hover:border-border-strong';
    const segment = (active: boolean) =>
        `flex h-9 cursor-pointer items-center rounded-sm px-3 text-sm ${
            active ? 'bg-border font-medium text-text' : 'text-text-muted hover:text-text'
        }`;

    return (
        <div className="flex w-full max-w-3xl flex-col gap-3 px-5 py-6">
            <div className="flex items-center gap-2">
                <h1 className="flex-1 text-3xl font-bold tracking-tight">
                    Essensplan
                </h1>
                <div
                    role="radiogroup"
                    aria-label="Ansicht"
                    className="flex rounded-md border border-border bg-surface p-[3px]"
                >
                    {(['week', 'month'] as const).map((v) => (
                        <button
                            key={v}
                            role="radio"
                            aria-checked={view === v}
                            onClick={() => setView(v)}
                            className={segment(view === v)}
                        >
                            {v === 'week' ? 'Woche' : 'Monat'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => step(-1)}
                    aria-label={view === 'week' ? 'Vorherige Woche' : 'Vorheriger Monat'}
                    className={iconButton}
                >
                    <ChevronLeft size={20} strokeWidth={1.5} aria-hidden />
                </button>
                <span className="flex-1 text-center font-mono text-sm uppercase">
                    {title}
                </span>
                <button
                    onClick={() => setAnchor(new Date())}
                    className="h-11 cursor-pointer rounded-md border border-border bg-surface px-3 text-sm hover:border-border-strong"
                >
                    Heute
                </button>
                <button
                    onClick={() => step(1)}
                    aria-label={view === 'week' ? 'Nächste Woche' : 'Nächster Monat'}
                    className={iconButton}
                >
                    <ChevronRight size={20} strokeWidth={1.5} aria-hidden />
                </button>
            </div>

            {error && (
                <p role="alert" className="text-danger">
                    {error}
                </p>
            )}
            {info && (
                <p role="status" className="text-primary">
                    {info}
                </p>
            )}

            {view === 'week' ? (
                <ul className="flex flex-col">
                    {days.map((d) => {
                        const date = ymd(d);
                        const meals = entries.filter((e) => e.date === date);
                        const isToday = date === today;
                        const [wd, dm] = fmt(d).split(', ');
                        return (
                            <li
                                key={date}
                                className="flex gap-3 border-b border-border py-2"
                            >
                                <span
                                    className={`w-11 shrink-0 pt-3 font-mono text-xs uppercase ${
                                        isToday ? 'text-primary' : 'text-text-muted'
                                    }`}
                                >
                                    {wd.replace('.', '')}
                                    <br />
                                    {dm?.slice(0, 2)}
                                    {isToday && (
                                        <>
                                            <br />
                                            Heute
                                        </>
                                    )}
                                </span>
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    {meals.length === 0 && (
                                        <button
                                            onClick={() => openAdd(date)}
                                            className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-border-strong text-sm text-text-muted hover:border-primary hover:text-text"
                                        >
                                            <Plus size={16} strokeWidth={1.5} aria-hidden />
                                            Rezept einplanen
                                        </button>
                                    )}
                                    {meals.map((m) => {
                                        const portions =
                                            m.servings ?? m.recipeId.servings ?? 1;
                                        return (
                                            <div
                                                key={m._id}
                                                className="flex h-11 items-center gap-1.5 rounded-md border border-border bg-surface pr-1 pl-2.5"
                                            >
                                                <Link
                                                    to={`/library/${m.recipeId._id}`}
                                                    className="min-w-0 flex-1 truncate text-text hover:text-primary"
                                                >
                                                    {m.recipeId.title}
                                                </Link>
                                                <span className="flex items-center rounded-sm border border-border-strong">
                                                    <button
                                                        onClick={() =>
                                                            changeServings(m, String(portions - 1))
                                                        }
                                                        disabled={portions <= 1}
                                                        aria-label="Weniger Portionen"
                                                        className="flex h-8 w-7 cursor-pointer items-center justify-center text-text-muted hover:text-text disabled:opacity-30"
                                                    >
                                                        <Minus size={14} aria-hidden />
                                                    </button>
                                                    <span
                                                        aria-label="Portionen"
                                                        className="w-5 text-center font-mono text-sm"
                                                    >
                                                        {portions}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            changeServings(m, String(portions + 1))
                                                        }
                                                        aria-label="Mehr Portionen"
                                                        className="flex h-8 w-7 cursor-pointer items-center justify-center text-text-muted hover:text-text"
                                                    >
                                                        <Plus size={14} aria-hidden />
                                                    </button>
                                                </span>
                                                <button
                                                    onClick={() => remove(m._id)}
                                                    aria-label="Aus dem Plan entfernen"
                                                    className="flex size-8 cursor-pointer items-center justify-center text-text-muted hover:text-danger"
                                                >
                                                    <X size={16} strokeWidth={1.5} aria-hidden />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                                {meals.length > 0 && (
                                    <button
                                        onClick={() => openAdd(date)}
                                        aria-label={`Rezept am ${fmt(d)} hinzufügen`}
                                        className="flex size-11 shrink-0 cursor-pointer items-center justify-center text-text-muted hover:text-primary"
                                    >
                                        <Plus size={20} strokeWidth={1.5} aria-hidden />
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="grid grid-cols-7 gap-1">
                    {WEEKDAYS.map((w) => (
                        <div
                            key={w}
                            className="py-1 text-center font-mono text-[11px] text-text-muted uppercase"
                        >
                            {w}
                        </div>
                    ))}
                    {days.map((d) => {
                        const date = ymd(d);
                        const meals = entries.filter((e) => e.date === date);
                        const outside = !date.startsWith(monthPrefix);
                        const isToday = date === today;
                        return (
                            // Tag antippen → Woche bearbeiten
                            <button
                                key={date}
                                onClick={() => {
                                    setAnchor(d);
                                    setView('week');
                                }}
                                aria-label={`Woche von ${fmt(d)} öffnen${
                                    meals.length ? `, ${meals.length} Rezepte` : ''
                                }`}
                                className={`flex min-h-18 min-w-0 cursor-pointer flex-col gap-0.5 overflow-hidden rounded-sm border bg-surface p-1 text-left hover:border-border-strong md:min-h-24 ${
                                    isToday ? 'border-primary' : 'border-border'
                                } ${outside ? 'opacity-35' : ''}`}
                            >
                                <span
                                    className={`font-mono text-xs ${
                                        isToday ? 'text-primary' : 'text-text'
                                    }`}
                                >
                                    {d.getDate()}
                                </span>
                                {meals.map((m) => (
                                    <span
                                        key={m._id}
                                        className="truncate rounded-[4px] bg-border px-1 py-0.5 text-[10px] leading-tight md:text-xs"
                                    >
                                        {m.recipeId.title}
                                    </span>
                                ))}
                            </button>
                        );
                    })}
                </div>
            )}

            {inScope.length > 0 && (
                <button
                    onClick={toCart}
                    className="mt-2 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary font-bold text-bg hover:bg-primary-soft md:self-start md:px-6"
                >
                    <ShoppingBasket size={18} aria-hidden />
                    {view === 'week' ? 'Woche' : 'Monat'} auf die Einkaufsliste
                </button>
            )}

            <dialog
                ref={modalRef}
                onClick={(e) => {
                    if (e.target === modalRef.current) modalRef.current?.close();
                }}
                aria-labelledby="planner-pick-title"
                className="mx-auto mt-auto mb-0 hidden max-h-[85vh] w-full max-w-lg flex-col gap-3.5 rounded-t-xl border-t border-border-strong bg-surface px-5 pt-3 pb-7 text-text open:flex backdrop:bg-black/60 md:m-auto md:rounded-xl md:border"
            >
                <span
                    aria-hidden
                    className="h-1 w-10 self-center rounded-full bg-border-strong md:hidden"
                />
                <div className="flex items-center gap-2">
                    <div className="flex flex-1 flex-col gap-0.5">
                        <span className="label-mono">
                            {addDate && fmt(new Date(`${addDate}T00:00`))}
                        </span>
                        <h2 id="planner-pick-title" className="text-xl font-bold">
                            Rezept einplanen
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => modalRef.current?.close()}
                        aria-label="Schließen"
                        className={iconButton}
                    >
                        <X size={20} strokeWidth={1.5} aria-hidden />
                    </button>
                </div>
                <RecipePicker key={pickerKey} recipes={recipes} onPick={pick} />
                <p className="text-sm text-text-muted">
                    Portionen wie im Rezept — anpassen danach in der Woche.
                </p>
            </dialog>
        </div>
    );
};

export default Planner;
