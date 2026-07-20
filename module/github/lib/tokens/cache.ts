// Server-side in-memory token cache

interface CacheEntry {
	token: string;
	expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export const tokenCache = {
	get(key: string): string | null {
		const entry = cache.get(key);
		if (!entry) return null;
		if (Date.now() > entry.expiresAt) {
			cache.delete(key);
			return null;
		}
		return entry.token;
	},
	set(key: string, token: string, ttlMs: number = 300000): void {
		cache.set(key, {
			token,
			expiresAt: Date.now() + ttlMs,
		});
	},
	delete(key: string): void {
		cache.delete(key);
	},
	clear(): void {
		cache.clear();
	}
};
