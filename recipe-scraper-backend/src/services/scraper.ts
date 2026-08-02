import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const YTDLP = process.env.YTDLP_PATH ?? 'yt-dlp';

// Video-Plattformen laufen über yt-dlp (Caption-Text). Alle anderen http(s)-Hosts
// werden als klassische Rezept-Webseite behandelt (schema.org Recipe JSON-LD).
const VIDEO_HOSTS = [
    'instagram.com',
    'facebook.com',
    'fb.watch',
    'tiktok.com',
    'youtube.com',
    'youtu.be',
];

export interface ScrapedText {
    source: string;
    title?: string;
    text: string;
}

const fail = (message: string, status: number): Error =>
    new Error(message, { cause: { status } });

const matchesHost = (host: string, base: string): boolean =>
    host === base || host.endsWith(`.${base}`);

const isVideoHost = (host: string): boolean =>
    VIDEO_HOSTS.some((h) => matchesHost(host, h));

// hostname-string check only, keine DNS-Auflösung (Rebinding-Bypass
// möglich). Auf resolve-then-check gegen die Socket-IP upgraden, falls das je
// unauthentifizierten Traffic at scale bedient.
const isPrivateHost = (host: string): boolean => {
    if (host === 'localhost' || host.endsWith('.local')) return true;
    if (host === '::1' || host.startsWith('fc') || host.startsWith('fd'))
        return true;
    const m = /^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/.exec(host);
    if (!m) return false;
    const [a, b] = [Number(m[1]), Number(m[2])];
    return (
        a === 127 || // loopback
        a === 10 || // private
        (a === 192 && b === 168) || // private
        (a === 172 && b >= 16 && b <= 31) || // private
        (a === 169 && b === 254) // link-local / cloud-metadata
    );
};

const assertSafeUrl = (url: string): URL => {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw fail('Ungültige URL', 400);
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw fail('Nur http/https-URLs erlaubt', 400);
    }
    if (isPrivateHost(parsed.hostname.replace(/^www\./, ''))) {
        throw fail('Host nicht erlaubt', 400);
    }
    return parsed;
};

/**
 * Extrahiert Rezept-Text aus einer URL: Video-Hosts über yt-dlp (Caption),
 * alle anderen Webseiten über schema.org Recipe JSON-LD.
 */
export const extractText = async (url: string): Promise<ScrapedText> => {
    const parsed = assertSafeUrl(url);
    const host = parsed.hostname.replace(/^www\./, '');
    return isVideoHost(host)
        ? extractVideoText(parsed)
        : fetchRecipeText(parsed);
};

const extractVideoText = async (parsed: URL): Promise<ScrapedText> => {
    let stdout: string;
    try {
        ({ stdout } = await execFileAsync(YTDLP, [
            '--dump-json',
            '--no-warnings',
            '--skip-download',
            parsed.href,
        ]));
    } catch (err) {
        const msg = (err as { stderr?: string }).stderr ?? String(err);
        if (/private|login|not available|unavailable/i.test(msg)) {
            throw fail('Inhalt privat oder nicht verfügbar', 422);
        }
        if ((err as { code?: string }).code === 'ENOENT') {
            throw fail(
                'yt-dlp ist nicht installiert (brew install yt-dlp)',
                500,
            );
        }
        throw fail('Konnte den Inhalt nicht abrufen', 502);
    }
    return parseDumpJson(stdout, parsed.href);
};

/** Reine Parsing-Logik, separat für Tests (kein Netzwerk). */
export const parseDumpJson = (stdout: string, source: string): ScrapedText => {
    let data: { title?: string; description?: string };
    try {
        data = JSON.parse(stdout);
    } catch {
        throw fail('Unerwartete Antwort von yt-dlp', 502);
    }
    const text = (data.description ?? '').trim();
    if (!text) {
        throw fail('Kein Beschreibungstext gefunden', 422);
    }
    return { source, title: data.title?.trim() || undefined, text };
};

/** Lädt die Webseite und baut aus dem JSON-LD Recipe einen Text-Blob für Gemini. */
const fetchRecipeText = async (parsed: URL): Promise<ScrapedText> => {
    let html: string;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        const res = await fetch(parsed.href, {
            signal: controller.signal,
            redirect: 'follow',
            headers: {
                // Manche Seiten blocken den Default-fetch-UA.
                'user-agent':
                    'Mozilla/5.0 (compatible; RecipeScraper/1.0; +https://github.com)',
                accept: 'text/html',
            },
        }).finally(() => clearTimeout(timeout));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // 5 MB Cap reicht für Rezeptseiten; kein Streaming nötig.
        if (Number(res.headers.get('content-length')) > 5_000_000) {
            throw fail('Seite zu groß', 502);
        }
        html = (await res.text()).slice(0, 5_000_000);
    } catch (err) {
        if ((err as { cause?: { status?: number } }).cause?.status) throw err;
        throw fail('Konnte die Seite nicht abrufen', 502);
    }

    const recipe = extractJsonLdRecipe(html);
    if (!recipe) {
        throw fail(
            'Kein Rezept auf dieser Seite gefunden (kein schema.org Recipe)',
            422,
        );
    }
    return recipeNodeToText(recipe, parsed.href);
};

type JsonLdNode = Record<string, unknown>;

const hasType = (node: JsonLdNode, type: string): boolean => {
    const t = node['@type'];
    return Array.isArray(t) ? t.includes(type) : t === type;
};

/** Findet den ersten Recipe-Knoten in beliebig verschachteltem JSON-LD. */
const findRecipe = (data: unknown): JsonLdNode | null => {
    if (Array.isArray(data)) {
        for (const item of data) {
            const found = findRecipe(item);
            if (found) return found;
        }
        return null;
    }
    if (data && typeof data === 'object') {
        const node = data as JsonLdNode;
        if (hasType(node, 'Recipe')) return node;
        if (node['@graph']) return findRecipe(node['@graph']);
    }
    return null;
};

/** Pure: extrahiert den Recipe-Knoten aus HTML (für Tests, kein Netzwerk). */
export const extractJsonLdRecipe = (html: string): JsonLdNode | null => {
    const re =
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
        let data: unknown;
        try {
            data = JSON.parse(m[1].trim());
        } catch {
            continue; // defektes JSON-LD-Block überspringen
        }
        const recipe = findRecipe(data);
        if (recipe) return recipe;
    }
    return null;
};

const asArray = <T>(v: T | T[] | undefined): T[] =>
    v == null ? [] : Array.isArray(v) ? v : [v];

/** recipeInstructions kann String, HowToStep[] oder HowToSection[] sein. */
const flattenInstructions = (instr: unknown): string[] => {
    const out: string[] = [];
    for (const item of asArray(instr as unknown[] | unknown)) {
        if (typeof item === 'string') {
            out.push(item);
        } else if (item && typeof item === 'object') {
            const node = item as JsonLdNode;
            if (node.itemListElement) {
                out.push(...flattenInstructions(node.itemListElement));
            } else if (typeof node.text === 'string') {
                out.push(node.text);
            }
        }
    }
    return out.map((s) => s.trim()).filter(Boolean);
};

const str = (v: unknown): string | undefined =>
    typeof v === 'string' && v.trim() ? v.trim() : undefined;

/** Baut aus dem JSON-LD Recipe einen Klartext-Blob, den parseRecipe strukturiert. */
export const recipeNodeToText = (
    node: JsonLdNode,
    source: string,
): ScrapedText => {
    const title = str(node.name);
    const ingredients = asArray(node.recipeIngredient as string[])
        .map((s) => (typeof s === 'string' ? s.trim() : ''))
        .filter(Boolean);
    const steps = flattenInstructions(node.recipeInstructions);

    const lines: string[] = [];
    if (title) lines.push(title, '');
    const yieldVal = str(node.recipeYield) ?? str(asArray(node.recipeYield)[0]);
    if (yieldVal) lines.push(`Portionen: ${yieldVal}`);
    const time = str(node.totalTime) ?? str(node.cookTime);
    if (time) lines.push(`Zeit: ${time}`);
    if (ingredients.length) lines.push('', 'Zutaten:', ...ingredients);
    if (steps.length) lines.push('', 'Zubereitung:', ...steps);

    const text = lines.join('\n').trim();
    if (!ingredients.length && !steps.length) {
        throw fail('Rezept ohne Zutaten oder Schritte gefunden', 422);
    }
    return { source, title, text };
};

export { assertSafeUrl };
