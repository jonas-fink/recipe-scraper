import { useState } from 'react';

export function ExtractForm({
    loading,
    onSubmit,
}: {
    loading: boolean;
    onSubmit: (url: string) => void;
}) {
    const [url, setUrl] = useState('');

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (url.trim()) onSubmit(url.trim());
            }}
            className="flex w-full max-w-2xl gap-2"
        >
            <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/…"
                className="flex-1 rounded-full border border-border bg-glass px-5 py-3 text-text
                    placeholder:text-text-subtle backdrop-blur-md outline-none focus:border-border-strong"
            />
            <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-gradient-brand px-6 py-3 font-semibold text-bg
                    disabled:opacity-50"
            >
                {loading ? 'Analysiere…' : 'Analysieren'}
            </button>
        </form>
    );
}
