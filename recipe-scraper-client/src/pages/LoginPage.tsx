import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { loginSchema, type LoginFormData } from '../schemas/authSchemas';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data);
            navigate('/');
        } catch {
            setError('root', { message: 'Email or password invalid' });
        }
    };
    return (
        <div className="flex flex-col gap-8 mt-16 w-full max-w-2xl px-4">
            <div className="flex flex-col text-left gap-2">
                <h1 className="font-display text-5xl text-text">
                    Welcome back
                </h1>
                <p className="font-sans text-text-muted">
                    Log in to your Reciply account
                </p>
            </div>
            <div className="bg-surface w-full p-2 rounded-md border border-border-strong hover:shadow-glow">
                <div className="flex flex-col justify-center items-center">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-4 w-full p-8"
                    >
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="email"
                                className="text-md text-text-subtle cursor-pointer hover:text-text"
                            >
                                EMAIL
                            </label>
                            <input
                                type="email"
                                id="email"
                                {...register('email')}
                                placeholder="you@example.com"
                                className="border border-border rounded-sm p-4 focus:outline-azure-soft bg-transparent font-mono"
                                required
                            />
                            {errors.email && (
                                <p className="text-danger text-xs">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="password"
                                className="text-md text-text-subtle cursor-pointer hover:text-text"
                            >
                                PASSWORD
                            </label>
                            <input
                                type="password"
                                id="password"
                                {...register('password')}
                                placeholder="**********"
                                className="border border-border rounded-sm p-4 focus:outline-azure-soft bg-transparent font-mono"
                                required
                            />
                            {errors.password && (
                                <p className="text-danger text-xs">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {errors.root && (
                            <p className="text-danger text-xs text-center">
                                {errors.root.message}
                            </p>
                        )}
                        <div className="flex justify-center pt-4">
                            {' '}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-md bg-gradient-brand px-6 py-3 font-semibold text-bg
                    disabled:opacity-50 shadow-shadow-glow hover:brightness-110 cursor-pointer w-full sm:w-1/4"
                            >
                                {isSubmitting ? 'signing in...' : 'sign in'}
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-sm text-text-muted">
                        No Account yet?{' '}
                        <Link
                            to="/signup"
                            className="text-azure-soft font-bold hover:underline cursor-pointer text-md"
                        >
                            Get started
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
