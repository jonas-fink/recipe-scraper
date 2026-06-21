export function Pill({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="inline-flex items-center gap-2 rounded-full border border-border bg-glass px-3.5 py-1.5
                    text-md font-semibold uppercase tracking-wide text-text-muted backdrop-blur-md "
        >
            <span className="size-1.5 rounded-full bg-gradient-brand" />
            {children}
        </div>
    );
}
