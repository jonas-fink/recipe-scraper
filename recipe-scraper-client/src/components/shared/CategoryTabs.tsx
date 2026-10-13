import { FOOD_CATEGORIES } from '../../api/recipes';

type CategoryTabsProps = {
    value: string; // '' = alle
    onChange: (category: string) => void;
};

// Unterstrich-Tabs „Alle + FOOD_CATEGORIES“ für Bibliothek, Community und Rezeptauswahl.
const CategoryTabs = ({ value, onChange }: CategoryTabsProps) => (
    <div
        role="tablist"
        aria-label="Kategorie"
        className="scrollbar-hide flex min-w-0 w-full gap-5 overflow-x-auto border-b border-border"
    >
        {['', ...FOOD_CATEGORIES].map((c) => (
            <button
                key={c}
                role="tab"
                aria-selected={value === c}
                onClick={() => onChange(c)}
                className={`-mb-px h-11 shrink-0 cursor-pointer border-b-2 ${
                    value === c
                        ? 'border-primary font-medium text-text'
                        : 'border-transparent text-text-muted hover:text-text'
                }`}
            >
                {c || 'Alle'}
            </button>
        ))}
    </div>
);

export default CategoryTabs;
