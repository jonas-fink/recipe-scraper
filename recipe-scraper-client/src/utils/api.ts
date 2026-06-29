const BASE = '/api/v1';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}

export function getAccessToken(): string | null {
    return accessToken;
}

let refreshPromise: Promise<boolean> | null = null;

export function tryRefresh(): Promise<boolean> {
    if (refreshPromise) return refreshPromise;
    refreshPromise = (async () => {
        try {
            const res = await fetch(`${BASE}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
            });
            if (!res.ok) return false;
            const json = await res.json();
            setAccessToken(json.data.accessToken);
            return true;
        } catch {
            return false;
        } finally {
            refreshPromise = null;
        }
    })();
    return refreshPromise;
}

async function request<T>(
    path: string,
    options: RequestInit = {},
    retry = true,
): Promise<T> {
    const isForm = options.body instanceof FormData;
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            ...(isForm ? {} : { 'Content-Type': 'application/json' }),
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...options.headers,
        },
    });

    if (res.status === 401 && retry) {
        const refreshed = await tryRefresh();
        if (refreshed) return request<T>(path, options, false);
        window.dispatchEvent(new Event('auth:logout'));
        throw new Error('Nicht autorisiert');
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `HTTP ${res.status}`);
    }

    if (res.status === 204) return undefined as T;

    const json = await res.json();
    return json.data as T;
}

export const api = {
    get<T>(path: string) {
        return request<T>(path);
    },
    post<T>(path: string, body?: unknown) {
        return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
    },
    patch<T>(path: string, body?: unknown) {
        return request<T>(path, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    },
    delete<T>(path: string) {
        return request<T>(path, { method: 'DELETE' });
    },
    put<T>(path: string, body?: unknown) {
        return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
    },
    upload<T>(path: string, form: FormData) {
        return request<T>(path, { method: 'POST', body: form });
    },
};
