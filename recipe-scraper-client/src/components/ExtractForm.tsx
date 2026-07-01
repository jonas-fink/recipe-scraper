import { useState } from 'react';
import { SocialPill } from './SocialPill';

const socialMedia = [
    { name: 'Instagram', bgColor: 'bg-danger' },
    { name: 'Facebook', bgColor: 'bg-azure' },
    { name: 'TikTok', bgColor: 'bg-warning' },
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
        <div className="flex flex-col w-full max-w-6xl gap-4 p-4 md:p-8 bg-glass rounded-md border border-border">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (url.trim()) onSubmit(url.trim());
                }}
                className="flex w-full md:gap-2 gap-4 md:flex-row flex-col justify-center items-center"
            >
                <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.instagram.com/reel/…"
                    className="flex-1 w-full rounded-md border border-border bg-glass px-5 py-3 text-text
                    placeholder:text-text-subtle backdrop-blur-md outline-none focus:border-border-strong font-mono"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-gradient-brand px-6 py-3 font-semibold text-bg w-full md:w-1/3
                    disabled:opacity-50 shadow-shadow-glow hover:brightness-110 cursor-pointer"
                >
                    {loading ? 'Analyzing...' : 'Analyze'}
                </button>
            </form>

            <div className="flex items-center gap-4 md:flex-row flex-col">
                <p className="text-text-subtle">Works with</p>
                {socialMedia.map((s) => (
                    <SocialPill
                        key={s.name}
                        bgColor={s.bgColor}
                        name={s.name}
                    />
                ))}
            </div>
        </div>
    );
}
