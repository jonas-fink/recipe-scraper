import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

type AuthFieldProps = {
    id: string;
    label: string;
    type: 'text' | 'email' | 'password';
    registration: UseFormRegisterReturn;
    placeholder?: string;
    autoComplete?: string;
    error?: string;
};

// Feld für Login/Registrierung; Passwortfelder bekommen einen Anzeigen-Schalter.
const AuthField = ({
    id,
    label,
    type,
    registration,
    placeholder,
    autoComplete,
    error,
}: AuthFieldProps) => {
    const [visible, setVisible] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="label-mono">
                {label}
            </label>
            <div
                className={`flex h-13 items-center rounded-md border bg-surface pl-3.5 focus-within:border-primary ${
                    error ? 'border-danger' : 'border-border-strong'
                }`}
            >
                <input
                    id={id}
                    type={isPassword && visible ? 'text' : type}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    {...registration}
                    className="h-full min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-text-subtle"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        aria-label={visible ? 'Passwort verbergen' : 'Passwort anzeigen'}
                        className="flex size-11 shrink-0 cursor-pointer items-center justify-center text-text-muted hover:text-text"
                    >
                        {visible ? (
                            <EyeOff size={20} strokeWidth={1.5} aria-hidden />
                        ) : (
                            <Eye size={20} strokeWidth={1.5} aria-hidden />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p id={`${id}-error`} className="font-mono text-xs text-danger">
                    {error}
                </p>
            )}
        </div>
    );
};

export default AuthField;
