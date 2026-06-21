import logo from '/src/assets/reciply-mark.svg';
import { Link } from 'react-router';

const Header = () => {
    return (
        <header className="w-full flex p-8 items-center justify-between bg-glass">
            <div className="flex gap-4 items-center justify-center">
                <img src={logo} width={32} height={32} />
                <h1 className="font-bold text-2xl text-text font-display">
                    Reciply
                </h1>
            </div>
            <div className="flex gap-8 items-center ">
                <Link to="/" className="text-md font-semibold text-text-subtle">
                    How it works
                </Link>
                <Link to="/" className="text-md font-semibold text-text-subtle">
                    Library
                </Link>
                <Link
                    to="/"
                    className="text-md font-semibold border border-border-strong px-4 py-1.5 rounded-md bg-surface hover:bg-elevated"
                >
                    Sign in
                </Link>
            </div>
        </header>
    );
};

export default Header;
