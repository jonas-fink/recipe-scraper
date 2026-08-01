import { useEffect, useState } from 'react';
import { getCart, setCart } from '../api/cart';
import type { Ingredient } from '../api/recipes';
import { RiCloseLine, RiShoppingCartLine } from 'react-icons/ri';

const label = (i: Ingredient) =>
    [i.amount, i.unit, i.name].filter((x) => x != null && x !== '').join(' ');

const Cart = () => {
    const [items, setItems] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    if (loading)
        return <p className="p-8 font-sans text-text-subtle">Loading…</p>;

    return (
        <div className="flex w-full flex-col items-center gap-6 px-4 py-8">
            <div className="flex w-full max-w-2xl items-center justify-between font-sans">
                <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-text">
                    <RiShoppingCartLine size={28} /> Einkaufsliste
                </h1>
                {items.length > 0 && (
                    <button
                        onClick={() => save([])}
                        className="rounded-full bg-danger px-4 py-2 font-semibold text-bg hover:brightness-110 cursor-pointer"
                    >
                        Alles löschen
                    </button>
                )}
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
