import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ALLOWED_HOSTS = [
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

const assertAllowedUrl = (url: string): URL => {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw fail('Ungültige URL', 400);
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw fail('Nur http/https-URLs erlaubt', 400);
    }
    const host = parsed.hostname.replace(/^www\./, '');
    const ok = ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
    if (!ok) {
        throw fail(
            `Host nicht unterstützt. Erlaubt: ${ALLOWED_HOSTS.join(', ')}`,
            400,
        );
    }
    return parsed;
};

/**
 * Extrahiert per yt-dlp den Beschreibungstext/Caption eines Reels o.ä.
 * ponytail: nur Caption/Beschreibung. Untertitel-Text und Whisper-Audio-Fallback
 *   (wenn `text` leer) hier später ergänzen — siehe KONTEXT.md Leiter-Stufe 2.
 */
export const extractText = async (url: string): Promise<ScrapedText> => {
    const parsed = assertAllowedUrl(url);

    let stdout: string;
    try {
        ({ stdout } = await execFileAsync('yt-dlp', [
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
            throw fail('yt-dlp ist nicht installiert (brew install yt-dlp)', 500);
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
        // ponytail: hier später Audio → Whisper, wenn Caption leer.
        throw fail('Kein Beschreibungstext gefunden', 422);
    }
    return { source, title: data.title?.trim() || undefined, text };
};

export { assertAllowedUrl };
