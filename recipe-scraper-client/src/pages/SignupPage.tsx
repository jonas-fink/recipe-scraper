import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { signupSchema, type RegisterFormData } from '../schemas/authSchemas';
import { useAuth } from '../context/AuthContext';
import AuthField from '../components/shared/AuthField';

const SignupPage = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<RegisterFormData>({ resolver: zodResolver(signupSchema) });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await signup({ ...data, name: data.name || undefined });
            navigate('/');
        } catch {
            setError('root', { message: 'Konto konnte nicht erstellt werden' });
        }
    };

    return (
        <div className="flex min-w-0 w-full max-w-md flex-col gap-8 px-5 pt-16 pb-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight">
                    Konto erstellen.
                </h1>
                <p className="text-text-muted">
                    Speichere Rezepte, plane deinen Einkauf, teile mit der
                    Community.
                </p>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
                noValidate
            >
                <AuthField
                    id="name"
                    label="Name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    registration={register('name')}
                    error={errors.name?.message}
                />
                <AuthField
                    id="email"
                    label="E-Mail"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    registration={register('email')}
                    error={errors.email?.message}
                />
                <div className="flex flex-col gap-1.5">
                    <AuthField
                        id="password"
                        label="Passwort"
                        type="password"
                        autoComplete="new-password"
                        registration={register('password')}
                        error={errors.password?.message}
                    />
                    {!errors.password && (
                        <p className="font-mono text-xs text-text-muted">
                            Mindestens 8 Zeichen
                        </p>
                    )}
                </div>
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
                    {isSubmitting ? 'Erstelle Konto…' : 'Registrieren'}
                </button>
            </form>

            <p className="text-center text-text-muted">
                Schon ein Konto?{' '}
                <Link to="/login" className="font-medium text-primary hover:underline">
                    Anmelden
                </Link>
            </p>
        </div>
    );
};

export default SignupPage;
