import { Link, Outlet } from 'react-router';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';

const AppLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="pl-safe pr-safe flex flex-1 flex-col items-center">
                <Outlet />
            </main>
            {/* Mobil Platz für das Dock lassen */}
            <footer
                className={`flex w-full flex-wrap justify-center gap-6 p-6 text-sm text-text-muted ${
                    user ? 'pb-below-dock-safe md:pb-6' : ''
                }`}
            >
                <Link to="/impressum" className="flex min-h-11 items-center hover:text-primary">
                    Impressum
                </Link>
                <Link to="/datenschutz" className="flex min-h-11 items-center hover:text-primary">
                    Datenschutz
                </Link>
                <Link to="/kontakt" className="flex min-h-11 items-center hover:text-primary">
                    Kontakt
                </Link>
                {user && (
                    <button
                        onClick={logout}
                        className="flex min-h-11 cursor-pointer items-center hover:text-danger md:hidden"
                    >
                        Abmelden
                    </button>
                )}
            </footer>
        </div>
    );
};

export default AppLayout;
