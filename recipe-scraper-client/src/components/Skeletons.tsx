const Row = () => (
    <div className="flex animate-pulse items-center gap-3.5 py-2.5">
        <div className="size-16 shrink-0 rounded-md bg-elevated" />
        <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-2/3 rounded-sm bg-elevated" />
            <div className="h-3 w-1/3 rounded-sm bg-elevated" />
        </div>
    </div>
);

export const ListSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className="flex w-full flex-col" aria-busy="true" aria-label="Lädt…">
        {Array.from({ length: count }, (_, i) => (
            <Row key={i} />
        ))}
    </div>
);
