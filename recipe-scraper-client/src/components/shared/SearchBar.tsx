type SearchBarProps = {
    query: string;
    onChange: (value: string) => void;
};

const SearchBar = ({ query, onChange }: SearchBarProps) => (
    <input
        type="search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by title or category…"
        className="w-full max-w-md rounded-full border border-border bg-elevated px-5 py-2 font-sans text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-accent"
    />
);

export default SearchBar;
