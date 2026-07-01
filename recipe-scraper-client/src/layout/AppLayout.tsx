import { Outlet } from 'react-router';
import Header from '../components/layout/Header';

const AppLayout = () => {
    return (
        <div className="flex flex-col min-h-screen font-sans antialiased">
            <Header />
            <div className="flex flex-col gap-8 justify-center items-center pt-24">
                <Outlet />
            </div>
        </div>
    );
};

export default AppLayout;
