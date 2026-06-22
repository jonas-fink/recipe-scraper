export interface User {
    id: string;
    name?: string;
    email: string;
    role: 'user' | 'admin';
}

export interface PopulatedUser {
    _id: string;
    id?: string;
    name: string;
    email?: string;
}

export interface AuthUser {
    id: string;
    name?: string;
    email: string;
    role: 'user' | 'admin';
}

export interface ApiResponse<T> {
    data: T;
}
