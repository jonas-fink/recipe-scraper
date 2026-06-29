type FilterButtonProps = {
    name: string;
    isActive: boolean;
    onSelect: () => void;
};

const FilterButton = ({ name, isActive, onSelect }: FilterButtonProps) => {
    return (
        <button
            className={`px-4 py-1.5 rounded-full ${isActive ? 'bg-gradient-brand text-black' : 'bg-elevated'} cursor-pointer hover:brightness-110`}
            onClick={onSelect}
        >
            {name}
        </button>
    );
};

export default FilterButton;
