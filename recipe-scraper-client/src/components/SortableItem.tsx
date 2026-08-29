import type React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Ingredient } from '../api/recipes';
import { RiCloseLine, RiDraggable } from 'react-icons/ri';

interface SortableItemProps extends Ingredient {
    onRemove: () => void;
}

const SortableItem = ({ amount, unit, name, onRemove }: SortableItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: name });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`flex touch-none cursor-grab select-none items-center justify-between gap-3 rounded-md px-2 py-2
                outline-none focus-visible:border-border-strong ${
                    isDragging
                        ? 'z-10 border border-border-strong bg-elevated opacity-80 shadow-card'
                        : 'border border-transparent hover:bg-border'
                }`}
        >
            <span className="flex min-w-0 items-center gap-2">
                <RiDraggable
                    size={18}
                    className="shrink-0 text-text-subtle"
                    aria-hidden
                />
                <span className="truncate">
                    {[amount, unit, name]
                        .filter((x) => x != null && x !== '')
                        .join(' ')}
                </span>
            </span>
            <button
                type="button"
                onClick={onRemove}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                aria-label="Entfernen"
                className="shrink-0 cursor-pointer rounded-full p-1 text-text-muted hover:text-danger"
            >
                <RiCloseLine size={20} />
            </button>
        </li>
    );
};

export default SortableItem;
