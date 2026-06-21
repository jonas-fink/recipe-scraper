import assert from 'node:assert/strict';
import { assertAllowedUrl, parseDumpJson } from './scraper.ts';

// URL-Allowlist
assert.equal(
    assertAllowedUrl('https://www.instagram.com/reel/abc').hostname,
    'www.instagram.com',
);
assert.throws(() => assertAllowedUrl('ftp://instagram.com/x'), /http/);
assert.throws(() => assertAllowedUrl('https://evil.com/x'), /nicht unterstützt/);
assert.throws(() => assertAllowedUrl('kaputt'), /Ungültige URL/);

// JSON-Parsing
const ok = parseDumpJson(
    JSON.stringify({ title: '  Pasta  ', description: '  2 Eier, Mehl  ' }),
    'https://instagram.com/reel/x',
);
assert.equal(ok.title, 'Pasta');
assert.equal(ok.text, '2 Eier, Mehl');

assert.throws(() => parseDumpJson('{nope', 'u'), /Unerwartete Antwort/);
assert.throws(
    () => parseDumpJson(JSON.stringify({ description: '   ' }), 'u'),
    /Kein Beschreibungstext/,
);

console.log('scraper: alle Checks bestanden ✓');
