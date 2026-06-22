import type { PopulatedUser } from '../types';

export function userId(u: PopulatedUser | string): string {
    return typeof u === 'string' ? u : (u.id ?? u._id);
}
