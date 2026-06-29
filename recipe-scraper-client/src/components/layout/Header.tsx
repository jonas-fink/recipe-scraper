import logo from '/src/assets/reciply-mark.svg';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { AiOutlineLogout } from 'react-icons/ai';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="w-full flex p-8 items-center justify-between bg-glass">
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
                <Link to="/" className="text-md font-semibold text-text-subtle">
                    How it works
                </Link>
                <Link
                    to="/community"
                    className="text-md font-semibold text-text-subtle"
                >
                    Community
                </Link>
                <Link
                    to="/library"
                    className="text-md font-semibold text-text-subtle"
                >
                    Library
                </Link>
                {user ? (
                    <button
                        onClick={logout}
                        aria-label="Logout"
                        className="hover:text-danger transition-all duration-300 ease-in cursor-pointer"
                    >
                        <AiOutlineLogout size={24} />
                    </button>
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
