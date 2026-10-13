import { useState } from 'react';
import { ArrowRight, Globe, Link as LinkIcon, LoaderCircle } from 'lucide-react';

// ponytail: Lucide hat keine Marken-Logos mehr; drei Stroke-Pfade inline statt simple-icons.
const Brand = ({ d }: { d: string[] }) => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {d.map((p) => (
            <path key={p} d={p} />
        ))}
    </svg>
);

const sources = [
    {
        name: 'Instagram',
        icon: (
            <Brand
                d={[
                    'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z',
                    'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
                    'M17.5 6.5h.01',
                ]}
            />
        ),
    },
    {
        name: 'TikTok',
        icon: <Brand d={['M16 3v11.5a4.5 4.5 0 1 1-4.5-4.5', 'M16 3c.6 2.6 2.4 4 5 4']} />,
    },
    {
        name: 'Facebook',
        icon: (
            <Brand
                d={[
                    'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
                ]}
            />
        ),
    },
    { name: 'Web', icon: <Globe size={18} strokeWidth={1.5} aria-hidden /> },
];

export function ExtractForm({
    loading,
    onSubmit,
}: {
    loading: boolean;
    onSubmit: (url: string) => void;
}) {
    const [url, setUrl] = useState('');

    return (
        <div className="flex w-full max-w-3xl flex-col gap-4 rounded-xl border border-border bg-surface p-4 md:p-6">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (url.trim()) onSubmit(url.trim());
                }}
                className="flex w-full flex-col gap-2 md:flex-row"
            >
                <label className="flex h-13 min-w-0 flex-1 items-center gap-2 rounded-md border border-border-strong bg-bg px-4 focus-within:border-primary">
                    <LinkIcon
                        size={18}
                        strokeWidth={1.5}
                        className="shrink-0 text-text-muted"
                        aria-hidden
                    />
                    <input
                        type="url"
                        required
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        aria-label="Rezept-Link"
                        placeholder="https://www.instagram.com/reel/…"
                        className="min-w-0 flex-1 bg-transparent font-mono text-text outline-none placeholder:text-text-subtle"
                    />
                </label>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex h-13 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 font-bold text-bg hover:bg-primary-soft disabled:opacity-50"
                >
                    {loading ? (
                        <LoaderCircle
                            size={22}
                            className="animate-spin"
                            aria-label="Wird extrahiert"
                        />
                    ) : (
                        <>
                            Rezept holen <ArrowRight size={18} aria-hidden />
                        </>
                    )}
                </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-text-muted">Funktioniert mit</span>
                {sources.map((s) => (
                    <span
                        key={s.name}
                        className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-bg px-2.5 text-sm"
                    >
                        {s.icon}
                        {s.name}
                    </span>
                ))}
            </div>
        </div>
    );
}
