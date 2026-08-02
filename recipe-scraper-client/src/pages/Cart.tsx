import { useEffect, useState, useRef } from 'react';
import { getCart, setCart } from '../api/cart';
import type { Ingredient } from '../api/recipes';
import { RiCloseLine, RiShoppingCartLine, RiAddFill } from 'react-icons/ri';

const label = (i: Ingredient) =>
    [i.amount, i.unit, i.name].filter((x) => x != null && x !== '').join(' ');

const Cart = () => {
    const [items, setItems] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        getCart()
            .then(setItems)
            .catch((e) => setError((e as Error).message))
            .finally(() => setLoading(false));
    }, []);

    const save = async (next: Ingredient[]) => {
        const prev = items;
        setItems(next); // optimistic
        try {
            setItems(await setCart(next));
        } catch (e) {
            setItems(prev);
            setError((e as Error).message);
        }
    };

    const addItem = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        const name = String(data.get('name')).trim();
        const amount = String(data.get('amount')).trim();
        const unit = String(data.get('unit')).trim();
        if (!name) return;
        save([
            ...items,
            { name, amount: amount ? Number(amount) : null, unit: unit || null },
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

    if (loading)
        return <p className="p-8 font-sans text-text-subtle">Loading…</p>;

    return (
        <div className="flex w-full flex-col items-center gap-6 px-4 py-8">
            <div className="flex w-full max-w-2xl items-center justify-between font-sans">
                <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-text">
                    <RiShoppingCartLine size={28} /> Einkaufsliste
                </h1>
                <div className="flex justify-center items-center gap-4">
                    <button
                        className="rounded-full flex cursor-pointer items-center bg-gradient-brand p-1 font-semibold text-bg hover:brightness-110"
                        onClick={openModal}
                    >
                        <RiAddFill size={32} />
                    </button>

                    <dialog
                        ref={modalRef}
                        onClick={(e) => {
                            if (e.target === modalRef.current) {
                                closeModal();
                            }
                        }}
                        className="m-auto hidden w-[90%] max-w-md rounded-2xl border border-border bg-elevated p-6 font-sans text-text
                        shadow-card open:block backdrop:bg-black/70 backdrop:backdrop-blur-sm"
                    >
                        <form
                            onSubmit={addItem}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="font-display text-xl font-bold text-text">
                                    Zutat hinzufügen
                                </h2>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    aria-label="Schließen"
                                    className="cursor-pointer rounded-full p-1 text-text-muted hover:text-text"
                                >
                                    <RiCloseLine size={22} />
                                </button>
                            </div>

                            <input
                                name="name"
                                type="text"
                                placeholder="Zutat"
                                required
                                autoFocus
                                className="rounded-md border border-border bg-glass px-4 py-3 font-mono text-text
                                placeholder:text-text-subtle outline-none focus:border-border-strong"
                            />
                            <div className="flex gap-3">
                                <input
                                    name="amount"
                                    type="number"
                                    step="any"
                                    min="0"
                                    placeholder="Menge"
                                    className="w-1/2 rounded-md border border-border bg-glass px-4 py-3 font-mono text-text
                                    placeholder:text-text-subtle outline-none focus:border-border-strong"
                                />
                                <input
                                    name="unit"
                                    type="text"
                                    placeholder="Einheit"
                                    className="w-1/2 rounded-md border border-border bg-glass px-4 py-3 font-mono text-text
                                    placeholder:text-text-subtle outline-none focus:border-border-strong"
                                />
                            </div>

                            <button
                                type="submit"
                                className="mt-2 cursor-pointer rounded-md bg-gradient-brand px-6 py-3 font-semibold text-bg hover:brightness-110"
                            >
                                Hinzufügen
                            </button>
                        </form>
                    </dialog>

                    {items.length > 0 && (
                        <button
                            onClick={() => save([])}
                            className="rounded-full bg-danger px-4 py-2 font-semibold text-bg hover:brightness-110 cursor-pointer"
                        >
                            Alles löschen
                        </button>
                    )}
                </div>
            </div>

            {error && <p className="font-sans text-danger">{error}</p>}

            <div className="w-full max-w-2xl rounded-2xl border border-border bg-glass p-6 shadow-card backdrop-blur-md">
                {items.length === 0 ? (
                    <p className="font-sans text-text-subtle">
                        Dein Einkaufskorb ist leer.
                    </p>
                ) : (
                    <ul className="flex flex-col divide-y divide-border font-sans text-text">
                        {items.map((ing, i) => (
                            <li
                                key={i}
                                className="flex items-center justify-between py-2"
                            >
                                <span>{label(ing)}</span>
                                <button
                                    onClick={() =>
                                        save(items.filter((_, j) => j !== i))
                                    }
                                    aria-label="Entfernen"
                                    className="cursor-pointer rounded-full p-1 text-text-muted hover:text-danger"
                                >
                                    <RiCloseLine size={20} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Cart;
