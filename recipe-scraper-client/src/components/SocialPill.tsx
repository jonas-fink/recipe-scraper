export type SocialMedia = {
    icon: React.ReactNode;
};

export function SocialPill({ icon }: SocialMedia) {
    return (
        <div
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-glass px-3.5 py-1.5
                    text-md font-semibold tracking-wide text-text-muted backdrop-blur-md font-sans"
        >
            {icon}
        </div>
    );
}
