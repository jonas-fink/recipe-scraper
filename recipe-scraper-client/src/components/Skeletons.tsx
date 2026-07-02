const Card = () => (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-border bg-glass shadow-card">
        <div className="aspect-video bg-elevated" />
        <div className="flex flex-col gap-3 p-4">
            <div className="h-6 w-24 rounded-full bg-elevated" />
            <div className="h-9 w-40 self-end rounded-full bg-elevated" />
        </div>
    </div>
);

export const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className="grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
            <Card key={i} />
        ))}
    </div>
);
