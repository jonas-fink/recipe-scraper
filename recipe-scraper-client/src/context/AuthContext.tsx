import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useNavigate } from 'react-router';
import { api, setAccessToken, tryRefresh } from '../utils/api';
import type { AuthUser } from '../types';

interface LoginInput {
    email: string;
    password: string;
}

interface SignupInput {
    name?: string;
    email: string;
    password: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    login: (input: LoginInput) => Promise<void>;
    signup: (input: SignupInput) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth has to be used within <AuthProvider>');
    return ctx;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const logoutRef = useRef<() => Promise<void> | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        async function init() {
            try {
                const ok = await tryRefresh();
                if (!ok) throw new Error('Invalid Session');
                const me = await api.get<AuthUser>('/auth/me');
                if (!cancelled) setUser(me);
            } catch {
                if (!cancelled) setUser(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        init();
        return () => {
            cancelled = true;
        };
    }, []);

    const login = useCallback(
        async ({ email, password }: LoginInput) => {
            const data = await api.post<{
                accessToken: string;
                user: AuthUser;
            }>('/auth/login', { email, password });
            setAccessToken(data.accessToken);
            setUser(data.user);
            navigate(data.user.role === 'admin' ? '/admin' : '/');
        },
        [navigate],
    );

    const signup = useCallback(
        async ({ name, email, password }: SignupInput) => {
            const data = await api.post<{
                accessToken: string;
                user: AuthUser;
            }>('/auth/register', { name, email, password });
            setAccessToken(data.accessToken);
            setUser(data.user);
            navigate(data.user.role === 'admin' ? '/admin' : '/');
        },
        [navigate],
    );

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            setAccessToken(null);
            setUser(null);
            navigate('/login');
        }
    }, [navigate]);

    logoutRef.current = logout;

    useEffect(() => {
        const handler = () => logoutRef.current?.();
        window.addEventListener('auth:logout', handler);
        return () => window.removeEventListener('auth:logout', handler);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
