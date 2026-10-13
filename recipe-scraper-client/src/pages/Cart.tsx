import { useEffect, useState, useRef } from 'react';
import { getCart, setCart } from '../api/cart';
import type { Ingredient } from '../api/recipes';
import { Plus, X } from 'lucide-react';
import SortableItem from '../components/SortableItem';
import { AISLES, AISLE_ORDER, aisleOf } from '../utils/aisles';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const Cart = () => {
    const [items, setItems] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDialogElement>(null);
    const [grouped, setGrouped] = useState(() => {
        try {
            return localStorage.getItem('cartGrouped') === '1';
        } catch {
            return false;
        }
    });

    const toggleGrouped = () => {
        setGrouped(!grouped);
        try {
            localStorage.setItem('cartGrouped', grouped ? '0' : '1');
        } catch {
            /* ignore: nur Komfort */
        }
    };

    useEffect(() => {
        getCart()
            .then(setItems)
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.name === active.id);
            const newIndex = items.findIndex((item) => item.name === over.id);
            save(arrayMove(items, oldIndex, newIndex));
        }
    };

    const save = async (next: Ingredient[]) => {
        const prev = items;
        setItems(next);
        try {
            setItems(await setCart(next));
        } catch (e) {
            setItems(prev);
            setError((e as Error).message);
        }
    };

    const addItem = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        const name = String(data.get('name')).trim();
        const amount = String(data.get('amount')).trim();
        const unit = String(data.get('unit')).trim();
        if (!name) return;
        save([
            ...items,
            {
                name,
                amount: amount ? Number(amount) : null,
                unit: unit || null,
            },
        ]);
        form.reset();
        closeModal();
    };

    const openModal = () => {
        modalRef.current?.showModal();
    };

    const closeModal = () => {
        modalRef.current?.close();
    };

    const renderItem = (ing: Ingredient) => (
        <SortableItem
            key={ing.name}
            {...ing}
            onAisleChange={
                grouped
                    ? (aisle) =>
                          save(
                              items.map((it) =>
                                  it === ing ? { ...it, aisle } : it,
                              ),
                          )
                    : undefined
            }
            onRemove={() => {
                if (!window.confirm('Willst du diese Zutat löschen?')) return;
                save(items.filter((it) => it !== ing));
            }}
        />
    );

    if (loading) return <p className="p-8 text-text-muted">Lädt…</p>;

    const field =
        'h-12 rounded-md border border-border-strong bg-bg px-3 text-text outline-none placeholder:text-text-subtle focus:border-primary';
    const segment = (active: boolean) =>
        `h-11 cursor-pointer rounded-sm text-sm ${
            active ? 'bg-border font-medium text-text' : 'text-text-muted hover:text-text'
        }`;

    return (
        <div className="flex min-w-0 w-full max-w-2xl flex-col gap-4 px-5 py-6">
            <div className="flex items-center gap-2">
                <h1 className="flex-1 text-3xl font-bold tracking-tight">
                    Einkaufsliste
                </h1>
                {items.length > 0 && (
                    <button
                        onClick={() => {
                            if (window.confirm('Ganze Einkaufsliste löschen?'))
                                save([]);
                        }}
                        className="h-11 cursor-pointer rounded-md px-3 text-sm text-text-muted hover:text-danger"
                    >
                        Alles löschen
                    </button>
                )}
                <button
                    onClick={openModal}
                    aria-label="Zutat hinzufügen"
                    className="flex size-11 cursor-pointer items-center justify-center rounded-md bg-primary text-bg hover:bg-primary-soft"
                >
                    <Plus size={20} aria-hidden />
                </button>
            </div>

            {items.length > 0 && (
                <div
                    role="radiogroup"
                    aria-label="Sortierung"
                    className="grid grid-cols-2 rounded-md border border-border bg-surface p-[3px]"
                >
                    <button
                        role="radio"
                        aria-checked={!grouped}
                        onClick={() => grouped && toggleGrouped()}
                        className={segment(!grouped)}
                    >
                        Eigene Reihenfolge
                    </button>
                    <button
                        role="radio"
                        aria-checked={grouped}
                        onClick={() => !grouped && toggleGrouped()}
                        className={segment(grouped)}
                    >
                        Nach Kategorie
                    </button>
                </div>
            )}

            {error && (
                <p role="alert" className="text-danger">
                    {error}
                </p>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map((i) => i.name)}
                    strategy={verticalListSortingStrategy}
                >
                    {items.length === 0 ? (
                        <p className="text-text-muted">
                            Deine Einkaufsliste ist leer.
                        </p>
                    ) : grouped ? (
                        AISLE_ORDER.map((id) => {
                            const group = items.filter(
                                (ing) => aisleOf(ing) === id,
                            );
                            if (group.length === 0) return null;
                            return (
                                <section key={id}>
                                    <h2 className="label-mono mb-1">
                                        {AISLES.find((a) => a.id === id)?.label}
                                    </h2>
                                    <ul className="flex flex-col">
                                        {group.map(renderItem)}
                                    </ul>
                                </section>
                            );
                        })
                    ) : (
                        <ul className="flex flex-col">{items.map(renderItem)}</ul>
                    )}
                </SortableContext>
            </DndContext>

            <dialog
                ref={modalRef}
                onClick={(e) => {
                    if (e.target === modalRef.current) closeModal();
                }}
                className="m-auto hidden w-[90%] max-w-md rounded-xl border border-border-strong bg-surface p-5 text-text open:block backdrop:bg-black/70"
            >
                <form onSubmit={addItem} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Zutat hinzufügen</h2>
                        <button
                            type="button"
                            onClick={closeModal}
                            aria-label="Schließen"
                            className="flex size-11 cursor-pointer items-center justify-center rounded-md text-text-muted hover:text-text"
                        >
                            <X size={20} strokeWidth={1.5} aria-hidden />
                        </button>
                    </div>
                    <input
                        name="name"
                        type="text"
                        placeholder="Zutat"
                        aria-label="Zutat"
                        required
                        autoFocus
                        className={field}
                    />
                    <div className="flex gap-2">
                        <input
                            name="amount"
                            type="number"
                            step="any"
                            min="0"
                            placeholder="Menge"
                            aria-label="Menge"
                            className={`${field} w-1/2 min-w-0 font-mono`}
                        />
                        <input
                            name="unit"
                            type="text"
                            placeholder="Einheit"
                            aria-label="Einheit"
                            className={`${field} w-1/2 min-w-0 font-mono`}
                        />
                    </div>
                    <button
                        type="submit"
                        className="mt-1 h-12 cursor-pointer rounded-md bg-primary font-bold text-bg hover:bg-primary-soft"
                    >
                        Hinzufügen
                    </button>
                </form>
            </dialog>
        </div>
    );
};

export default Cart;
