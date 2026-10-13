import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { loginSchema, type LoginFormData } from '../schemas/authSchemas';
import { useAuth } from '../context/AuthContext';
import AuthField from '../components/shared/AuthField';

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
            setError('root', { message: 'E-Mail oder Passwort ungültig' });
        }
    };

    return (
        <div className="flex min-w-0 w-full max-w-md flex-col gap-8 px-5 pt-16 pb-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight">
                    Willkommen zurück.
                </h1>
                <p className="text-text-muted">
                    Melde dich an, um deine Rezepte zu sehen.
                </p>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
                noValidate
            >
                <AuthField
                    id="email"
                    label="E-Mail"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    registration={register('email')}
                    error={errors.email?.message}
                />
                <AuthField
                    id="password"
                    label="Passwort"
                    type="password"
                    autoComplete="current-password"
                    registration={register('password')}
                    error={errors.password?.message}
                />
                {errors.root && (
                    <p role="alert" className="font-mono text-xs text-danger">
                        {errors.root.message}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 h-13 cursor-pointer rounded-md bg-primary font-bold text-bg hover:bg-primary-soft disabled:opacity-50"
                >
                    {isSubmitting ? 'Melde an…' : 'Anmelden'}
                </button>
            </form>

            <p className="text-center text-text-muted">
                Noch kein Konto?{' '}
                <Link to="/signup" className="font-medium text-primary hover:underline">
                    Registrieren
                </Link>
            </p>
        </div>
    );
};

export default LoginPage;
