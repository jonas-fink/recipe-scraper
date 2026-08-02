import assert from 'node:assert/strict';
import {
    assertSafeUrl,
    parseDumpJson,
    extractJsonLdRecipe,
    recipeNodeToText,
} from './scraper.ts';

// URL-Validierung: http/https erzwingen, Private-Hosts (SSRF) blocken.
assert.equal(
    assertSafeUrl('https://www.instagram.com/reel/abc').hostname,
    'www.instagram.com',
);
assert.equal(
    assertSafeUrl('https://www.chefkoch.de/rezepte/x').hostname,
    'www.chefkoch.de',
);
assert.throws(() => assertSafeUrl('ftp://instagram.com/x'), /http/);
assert.throws(() => assertSafeUrl('kaputt'), /Ungültige URL/);
assert.throws(() => assertSafeUrl('http://localhost/x'), /nicht erlaubt/);
assert.throws(() => assertSafeUrl('http://127.0.0.1/x'), /nicht erlaubt/);
assert.throws(() => assertSafeUrl('http://192.168.0.5/x'), /nicht erlaubt/);
assert.throws(
    () => assertSafeUrl('http://169.254.169.254/latest'),
    /nicht erlaubt/,
);

// yt-dlp JSON-Parsing
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

// JSON-LD-Extraktion: findet Recipe im @graph, normalisiert HowToStep + HowToSection.
const html = `
<html><head>
<script type="application/ld+json">{"@type":"WebPage","name":"ignore"}</script>
<script type="application/ld+json">{ bad json </script>
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
        { '@type': 'Organization', name: 'Chefkoch' },
        {
            '@type': ['Recipe', 'NewsArticle'],
            name: 'Spaghetti Carbonara',
            recipeYield: '4 Portionen',
            totalTime: 'PT30M',
            recipeIngredient: ['500 g Spaghetti', '200 g Speck'],
            recipeInstructions: [
                { '@type': 'HowToStep', text: 'Nudeln kochen.' },
                {
                    '@type': 'HowToSection',
                    itemListElement: [
                        { '@type': 'HowToStep', text: 'Speck anbraten.' },
                    ],
                },
            ],
        },
    ],
})}</script>
</head></html>`;

const node = extractJsonLdRecipe(html);
assert.ok(node, 'Recipe-Knoten gefunden');
const scraped = recipeNodeToText(node!, 'https://www.chefkoch.de/rezepte/x');
assert.equal(scraped.title, 'Spaghetti Carbonara');
assert.match(scraped.text, /500 g Spaghetti/);
assert.match(scraped.text, /Nudeln kochen\./);
assert.match(scraped.text, /Speck anbraten\./); // HowToSection abgeflacht
assert.match(scraped.text, /Portionen: 4 Portionen/);

// Keine Rezept-Seite → null
assert.equal(
    extractJsonLdRecipe('<html><body>no ld+json here</body></html>'),
    null,
);

console.log('scraper: alle Checks bestanden ✓');
