import { Search } from 'lucide-react';

type SearchBarProps = {
    query: string;
    onChange: (value: string) => void;
};

const SearchBar = ({ query, onChange }: SearchBarProps) => (
    <label className="flex h-11 w-full items-center gap-2 rounded-md border border-border bg-surface px-3 focus-within:border-primary">
        <Search
            size={18}
            strokeWidth={1.5}
            className="shrink-0 text-text-muted"
            aria-hidden
        />
        <input
            type="search"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Rezepte durchsuchen"
            placeholder="Suche nach Name oder Kategorie"
            className="min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-text-subtle"
        />
    </label>
);

export default SearchBar;
