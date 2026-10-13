import type React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Ingredient } from '../api/recipes';
import { GripVertical, X } from 'lucide-react';
import { AISLES, aisleOf } from '../utils/aisles';

interface SortableItemProps extends Ingredient {
    onRemove: () => void;
    // Gesetzt = Bereichsauswahl anzeigen (Kategorie-Ansicht).
    onAisleChange?: (aisle: string) => void;
}

const SortableItem = ({
    amount,
    unit,
    name,
    aisle,
    onRemove,
    onAisleChange,
}: SortableItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: name, disabled: !!onAisleChange }); // Kategorie-Ansicht: kein Drag

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const qty = [amount, unit].filter((x) => x != null && x !== '').join(' ');

    return (
        <li
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`flex min-h-12 items-center gap-2.5 border-b select-none ${
                onAisleChange ? '' : 'touch-none cursor-grab'
            } ${
                isDragging
                    ? 'relative z-10 rounded-md border border-border-strong bg-elevated px-2 shadow-[0_8px_24px_rgb(0_0_0/0.5)]'
                    : 'border-border'
            }`}
        >
            {!onAisleChange && (
                <GripVertical
                    size={18}
                    strokeWidth={1.5}
                    className={`shrink-0 ${isDragging ? 'text-primary' : 'text-text-subtle'}`}
                    aria-hidden
                />
            )}
            <span className="w-20 shrink-0 font-mono text-sm whitespace-nowrap text-primary">
                {qty}
            </span>
            <span className="min-w-0 flex-1 truncate">{name}</span>
            {onAisleChange && (
                <select
                    value={aisleOf({ name, aisle })}
                    onChange={(e) => onAisleChange(e.target.value)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    aria-label={`Bereich für ${name}`}
                    className="h-8 max-w-24 shrink-0 cursor-pointer rounded-sm border border-border bg-surface px-1.5 text-xs text-text-muted md:max-w-32"
                >
                    {AISLES.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.label}
                        </option>
                    ))}
                </select>
            )}
            <button
                type="button"
                onClick={onRemove}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                aria-label={`${name} entfernen`}
                className="flex size-10 shrink-0 cursor-pointer items-center justify-center text-text-muted hover:text-danger"
            >
                <X size={18} strokeWidth={1.5} aria-hidden />
            </button>
        </li>
    );
};

export default SortableItem;
