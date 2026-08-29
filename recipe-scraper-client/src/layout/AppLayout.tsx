import { Link, Outlet } from 'react-router';
import Header from '../components/layout/Header';

const AppLayout = () => {
    return (
        <div className="flex flex-col min-h-screen font-sans antialiased">
            <Header />
            <div className="flex flex-col gap-8 justify-center items-center pt-24">
                <Outlet />
            </div>
            <footer className="mt-auto flex w-full justify-center gap-6 p-6 text-sm text-text-muted font-sans">
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
