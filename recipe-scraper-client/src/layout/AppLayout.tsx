import { Link, Outlet } from 'react-router';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';

const AppLayout = () => {
    const { user } = useAuth();

    return (
        <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="flex flex-1 flex-col items-center">
                <Outlet />
            </main>
            {/* Mobil Platz für das Dock lassen (Dockhöhe + Safe Area) */}
            <footer
                className={`flex w-full flex-wrap justify-center gap-x-6 gap-y-2 border-t border-border px-6 pt-4 text-xs text-text-muted ${
                    user
                        ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-4'
                        : 'pb-[max(1rem,env(safe-area-inset-bottom))]'
                }`}
            >
                <Link to="/impressum" className="hover:text-primary">
                    Impressum
                </Link>
                <Link to="/datenschutz" className="hover:text-primary">
                    Datenschutz
                </Link>
                <Link to="/kontakt" className="hover:text-primary">
                    Kontakt
                </Link>
            </footer>
        </div>
    );
};

export default AppLayout;
