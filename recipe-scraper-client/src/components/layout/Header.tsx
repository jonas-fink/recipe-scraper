import logo from '/src/assets/reciply-mark.svg';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    Link as LinkIcon,
    LogOut,
    ShoppingBasket,
    Users,
    X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TABS = [
    { to: '/library', label: 'Bibliothek', Icon: BookOpen },
    { to: '/planner', label: 'Plan', Icon: CalendarDays },
    { to: '/cart', label: 'Einkauf', Icon: ShoppingBasket },
    { to: '/community', label: 'Community', Icon: Users },
];

// Aufklappbares Link-Feld unter der Topbar: die Extraktion selbst läuft auf der Startseite (?url=…).
const PasteForm = ({ onDone }: { onDone: () => void }) => {
    const navigate = useNavigate();
    const [url, setUrl] = useState('');

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const u = url.trim();
                if (!u) return;
                navigate(`/?url=${encodeURIComponent(u)}`);
                setUrl('');
                onDone();
            }}
            onKeyDown={(e) => e.key === 'Escape' && onDone()}
            className="mx-auto flex w-full max-w-3xl gap-2"
        >
            <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-md border border-border-strong bg-bg px-3 focus-within:border-primary md:h-11">
                <LinkIcon
                    size={18}
                    strokeWidth={1.5}
                    className="shrink-0 text-text-muted"
                    aria-hidden
                />
                <input
                    type="url"
                    required
                    autoFocus
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    aria-label="Rezept-Link"
                    placeholder="Link einfügen…"
                    className="min-w-0 flex-1 bg-transparent font-mono text-sm text-text outline-none placeholder:text-text-subtle"
                />
            </label>
            <button
                type="submit"
                aria-label="Rezept extrahieren"
                className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-md bg-primary text-bg hover:bg-primary-soft md:size-11"
            >
                <ArrowRight size={20} aria-hidden />
            </button>
        </form>
    );
};

const Header = () => {
    const { user, logout } = useAuth();
    const [pasteOpen, setPasteOpen] = useState(false);

    const brand = (
        <Link
            to={user ? '/library' : '/'}
            className="flex items-center gap-2.5 text-text"
        >
            <img src={logo} width={32} height={32} alt="" />
            <span className="text-xl font-bold">reciply</span>
        </Link>
    );

    if (!user)
        return (
            <header className="flex items-center justify-between border-b border-border bg-surface px-5 py-3 md:px-8">
                {brand}
                <Link
                    to="/login"
                    className="flex h-11 items-center rounded-md border border-border-strong px-4 font-medium text-text hover:bg-elevated"
                >
                    Anmelden
                </Link>
            </header>
        );

    const pasteToggle = (
        <button
            onClick={() => setPasteOpen((o) => !o)}
            aria-expanded={pasteOpen}
            aria-controls="paste-panel"
            aria-label={pasteOpen ? 'Link-Feld schließen' : 'Rezept per Link hinzufügen'}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary font-medium text-bg hover:bg-primary-soft md:w-auto md:px-3"
        >
            {pasteOpen ? (
                <X size={20} aria-hidden />
            ) : (
                <LinkIcon size={20} aria-hidden />
            )}
            <span className="hidden md:inline">Rezept</span>
        </button>
    );

    const logoutButton = (
        <button
            onClick={logout}
            aria-label="Abmelden"
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-sm text-text-muted hover:text-danger"
        >
            <LogOut size={20} strokeWidth={1.5} aria-hidden />
        </button>
    );

    return (
        <>
            <div className="sticky top-0 z-20">
                {/* Desktop: Topbar mit Labels */}
                <header className="hidden items-center gap-x-8 border-b border-border bg-surface px-8 py-3 md:flex">
                    {brand}
                    <nav
                        aria-label="Hauptnavigation"
                        className="ml-auto flex flex-wrap gap-1"
                    >
                        {TABS.map(({ to, label, Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex h-10 items-center gap-2 rounded-sm px-3 ${
                                        isActive
                                            ? 'bg-elevated text-text'
                                            : 'text-text-muted hover:text-text'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon
                                            size={18}
                                            strokeWidth={1.5}
                                            className={
                                                isActive ? 'text-primary' : ''
                                            }
                                            aria-hidden
                                        />
                                        {label}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="flex items-center gap-1">
                        {pasteToggle}
                        {logoutButton}
                    </div>
                </header>

                {/* Mobil: schmale Topbar */}
                <header className="flex h-14 items-center gap-1 border-b border-border bg-surface px-4 md:hidden">
                    <div className="flex-1">{brand}</div>
                    {pasteToggle}
                    {logoutButton}
                </header>

                {pasteOpen && (
                    <div
                        id="paste-panel"
                        className="border-b border-border bg-surface px-4 py-3 md:px-8"
                    >
                        <PasteForm onDone={() => setPasteOpen(false)} />
                    </div>
                )}
            </div>

            {/* Mobil: Dock unten */}
            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface px-3 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden">
                <nav aria-label="Hauptnavigation" className="grid grid-cols-4">
                    {TABS.map(({ to, label, Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex h-14 flex-col items-center justify-center gap-1 ${
                                    isActive
                                        ? 'text-primary'
                                        : 'text-text-muted'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span
                                        className={`flex h-7 w-12 items-center justify-center rounded-full ${
                                            isActive ? 'bg-elevated' : ''
                                        }`}
                                    >
                                        <Icon
                                            size={20}
                                            strokeWidth={1.5}
                                            aria-hidden
                                        />
                                    </span>
                                    <span
                                        className={`label-mono text-[10px] tracking-normal ${
                                            isActive ? 'text-text' : ''
                                        }`}
                                    >
                                        {label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Header;
