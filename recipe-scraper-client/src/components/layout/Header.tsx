import logo from '/src/assets/reciply-mark.svg';
import { Link, NavLink } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import {
    RiUserCommunityLine,
    RiBookOpenLine,
    RiLogoutBoxLine,
} from 'react-icons/ri';

const Header = () => {
    const { user, logout } = useAuth();

    const navClass = ({ isActive }: { isActive: boolean }) =>
        `text-md font-semibold ${isActive ? 'text-primary text-shadow-accent hover:brightness-110' : 'text-text-muted'}`;

    return (
        <header className="w-full flex p-8 items-center justify-between bg-glass fixed z-10">
            <div className="flex gap-4 items-center justify-center">
                <Link to="/" className="flex gap-2">
                    {' '}
                    <img src={logo} width={32} height={32} />
                    <h1 className="font-bold text-2xl text-text font-display">
                        Reciply
                    </h1>
                </Link>
            </div>
            <div className="flex gap-8 items-center ">
                {user ? (
                    <div className="flex gap-8 items-center ">
                        <NavLink to="/community" className={navClass}>
                            <RiUserCommunityLine size={36} />
                            {/* Community */}
                        </NavLink>
                        <NavLink to="/library" className={navClass}>
                            <RiBookOpenLine size={36} />
                            {/* Library */}
                        </NavLink>
                        <button
                            onClick={logout}
                            aria-label="Logout"
                            className="hover:text-danger transition-all duration-300 ease-in cursor-pointer"
                        >
                            <RiLogoutBoxLine size={24} />
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="text-md font-semibold border border-border-strong px-4 py-1.5 rounded-md bg-surface hover:bg-elevated"
                    >
                        Sign in
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;
