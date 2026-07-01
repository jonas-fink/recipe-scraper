import { LRUCache } from 'lru-cache';

// ponytail: in-memory, single instance — swap to Redis if scaled out.
// Keyed by source URL; caches the parsed recipe so identical URLs skip yt-dlp + Gemini.
export const extractCache = new LRUCache<string, object>({
    max: 500,
    ttl: 24 * 60 * 60 * 1000, // 1 day
});
