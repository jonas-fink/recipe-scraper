/**
 * Logged-in overflow audit — Playwright script.
 *
 * Auth is mocked at network level via page.route() (catch-all first, specific
 * routes registered LAST so they take priority — Playwright matches the last
 * registered handler first).
 *
 * Realistic mock data: 6 recipes with long German titles, meal plan entries,
 * shopping list items. Pages are asserted to render logged-in content before
 * the overflow check, so a broken mock fails loudly.
 *
 * Run:  npm run overflow-check
 *       (dev server must be running on http://localhost:5173)
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:5173';

// AuthUser uses `id` (not `_id`): src/types/index.ts line 15
const MOCK_USER = { id: 'u1', email: 'test@test.de', name: 'Test', role: 'user' };

const RECIPE_ID = 'r1';

const MOCK_RECIPES = [
    { _id: 'r1', title: 'Spaghetti Carbonara mit geräuchertem Schwarzwälder Schinken und Pecorino Romano', ingredients: [{ name: 'Spaghetti', amount: 400, unit: 'g' }, { name: 'Ei', amount: 4, unit: null }, { name: 'Guanciale', amount: 200, unit: 'g' }], instructions: ['Wasser kochen.', 'Pasta kochen.', 'Sauce mischen.'], category: 'Dinner', cookTimeMinutes: 25, servings: 4, isPublished: false, isFavorite: true, sourceUrl: 'https://example.com/1' },
    { _id: 'r2', title: 'Ofengeröstetes Gemüse mit Zitronenkräuter-Marinade und Feta', ingredients: [{ name: 'Zucchini', amount: 2, unit: null }], instructions: ['Alles schneiden.', 'Im Ofen rösten.'], category: 'Vegetarian', cookTimeMinutes: 40, servings: 2, isFavorite: false, sourceUrl: 'https://example.com/2' },
    { _id: 'r3', title: 'Französische Zwiebelsuppe mit überbackenem Gruyère-Crouton', ingredients: [{ name: 'Zwiebeln', amount: 1, unit: 'kg' }], instructions: ['Zwiebeln karamellisieren.'], category: 'Lunch', cookTimeMinutes: 60, servings: 4, isFavorite: false, sourceUrl: 'https://example.com/3' },
    { _id: 'r4', title: 'Blaubeer-Hafer-Pfannkuchen mit Ahornsirup', ingredients: [{ name: 'Haferflocken', amount: 150, unit: 'g' }], instructions: ['Teig mischen.', 'Backen.'], category: 'Breakfast', cookTimeMinutes: 20, servings: 2, isFavorite: false, sourceUrl: 'https://example.com/4' },
    { _id: 'r5', title: 'Mango-Lassi mit frischer Minze und Kardamom', ingredients: [{ name: 'Mango', amount: 1, unit: null }, { name: 'Joghurt', amount: 200, unit: 'ml' }], instructions: ['Alles mixen.'], category: 'Drink', cookTimeMinutes: 5, servings: 2, isFavorite: true, sourceUrl: 'https://example.com/5' },
    { _id: 'r6', title: 'Schokoladen-Lava-Cake mit Vanilleeis und Karamell-Sauce', ingredients: [{ name: 'Schokolade', amount: 200, unit: 'g' }], instructions: ['Schmelzen.', 'Backen.'], category: 'Dessert', cookTimeMinutes: 15, servings: 4, isFavorite: false, sourceUrl: 'https://example.com/6' },
];

const today = new Date().toISOString().slice(0, 10);
const MOCK_PLAN = [
    { _id: 'mp1', date: today, servings: 4, recipeId: { _id: 'r1', title: MOCK_RECIPES[0].title, imageUrl: null, ingredients: MOCK_RECIPES[0].ingredients, servings: 4 } },
    { _id: 'mp2', date: today, servings: 2, recipeId: { _id: 'r2', title: MOCK_RECIPES[1].title, imageUrl: null, ingredients: MOCK_RECIPES[1].ingredients, servings: 2 } },
];

const MOCK_CART = [
    { name: 'Spaghetti', amount: 400, unit: 'g' },
    { name: 'Guanciale – Luftgetrocknetes Schweinebackenfleisch', amount: 200, unit: 'g' },
    { name: 'Pecorino Romano, fein gerieben', amount: 80, unit: 'g' },
    { name: 'Eier (Größe L)', amount: 4, unit: null },
    { name: 'Schwarzer Pfeffer, frisch gemahlen', amount: null, unit: null },
];

/**
 * Register route mocks. IMPORTANT: catch-all is first (lowest priority).
 * Specific routes are registered LAST (Playwright: last registered = first matched).
 */
async function mockAuth(page) {
    // 1. Catch-all fallback for unmatched API calls
    await page.route('**/api/v1/**', (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: [] }),
        }),
    );

    // 2. Recipes — registered after catch-all, takes priority
    await page.route('**/api/v1/recipes', (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: MOCK_RECIPES }),
        }),
    );

    // 3. Specific recipe (for RecipeDetail / CookMode)
    await page.route(`**/api/v1/recipes/${RECIPE_ID}`, (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: MOCK_RECIPES[0] }),
        }),
    );

    // 4. Community recipes
    await page.route('**/api/v1/community', (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: MOCK_RECIPES.map((r) => ({ ...r, isPublished: true, userId: { name: 'Alice' } })) }),
        }),
    );

    // 5. Meal plan
    await page.route('**/api/v1/mealplan**', (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: MOCK_PLAN }),
        }),
    );

    // 6. Shopping cart
    await page.route('**/api/v1/cart', (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: MOCK_CART }),
        }),
    );

    // 7. Auth — registered LAST = highest priority
    await page.route('**/api/v1/auth/refresh', (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: { accessToken: 'fake-token-for-testing' } }),
        }),
    );
    await page.route('**/api/v1/auth/me', (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: MOCK_USER }),
        }),
    );
}

/** Assert the page rendered logged-in content (not a redirect to /login). */
async function assertLoggedIn(page, pageName) {
    const url = page.url();
    if (url.includes('/login') || url.includes('/signup')) {
        throw new Error(`[${pageName}] Auth mock failed — redirected to ${url}. Check route order and AuthUser fields.`);
    }
    // Check that there's some content rendered (not just a loading spinner)
    const bodyText = await page.locator('body').innerText().catch(() => '');
    if (!bodyText || bodyText.trim().length < 10) {
        throw new Error(`[${pageName}] Page body has no meaningful content — mock may have failed.`);
    }
}

async function checkOverflow(page) {
    return page.evaluate(() => {
        const docScrollWidth = document.documentElement.scrollWidth;
        const docClientWidth = document.documentElement.clientWidth;
        const hasOverflow = docScrollWidth > docClientWidth;

        const offenders = [];
        if (hasOverflow) {
            document.querySelectorAll('*').forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.right > docClientWidth + 1 || rect.left < -1) {
                    offenders.push({
                        tag: el.tagName.toLowerCase(),
                        cls: (el.className?.toString() ?? '').slice(0, 80),
                        right: Math.round(rect.right),
                        overflowBy: Math.round(rect.right - docClientWidth),
                    });
                }
            });
        }
        return { scrollWidth: docScrollWidth, clientWidth: docClientWidth, hasOverflow, offenders: offenders.slice(0, 5) };
    });
}

const PAGES = [
    // Public
    { name: 'Landing (?url=)',   path: '/?url=https://example.com', auth: false },
    { name: 'Login',             path: '/login',                     auth: false },
    { name: 'Signup',            path: '/signup',                    auth: false },
    { name: 'Impressum',         path: '/impressum',                 auth: false },
    { name: 'Datenschutz',       path: '/datenschutz',               auth: false },
    { name: 'Kontakt',           path: '/kontakt',                   auth: false },
    // Auth-gated
    { name: 'Library',           path: '/library',                   auth: true },
    { name: 'RecipeDetail',      path: `/library/${RECIPE_ID}`,      auth: true },
    { name: 'CookMode',          path: `/library/${RECIPE_ID}/cook`, auth: true },
    { name: 'Planner (week)',    path: '/planner',                   auth: true },
    { name: 'Cart',              path: '/cart',                      auth: true },
    { name: 'Community',         path: '/community',                 auth: true },
    { name: 'CommunityDetail',   path: `/community/${RECIPE_ID}`,    auth: true },
];

const VIEWPORTS = [
    { label: '320px',              w: 320,  h: 900,  dpr: 1   },
    { label: '360px',              w: 360,  h: 900,  dpr: 1   },
    { label: '375px',              w: 375,  h: 900,  dpr: 1   },
    { label: '390px',              w: 390,  h: 900,  dpr: 1   },
    { label: '412px (Pixel 8 Pro)',w: 412,  h: 915,  dpr: 3.5 },
    { label: '430px',              w: 430,  h: 900,  dpr: 1   },
    { label: '915×412 landscape',  w: 915,  h: 412,  dpr: 3.5 },
    { label: '1280px (desktop)',   w: 1280, h: 800,  dpr: 1   },
];

const UA_MOBILE = 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

async function run() {
    const browser = await chromium.launch();
    const results = [];
    let errorCount = 0;

    for (const vp of VIEWPORTS) {
        const isPhone = vp.w <= 430;
        const context = await browser.newContext({
            viewport: { width: vp.w, height: vp.h },
            deviceScaleFactor: vp.dpr,
            userAgent: isPhone ? UA_MOBILE : undefined,
        });

        for (const pg of PAGES) {
            const page = await context.newPage();
            try {
                if (pg.auth) await mockAuth(page);
                await page.goto(BASE + pg.path, { waitUntil: 'networkidle', timeout: 20000 });
                await page.waitForTimeout(600);

                if (pg.auth) await assertLoggedIn(page, pg.name);

                const data = await checkOverflow(page);
                results.push({ page: pg.name, viewport: vp.label, ...data });

                const flag = data.hasOverflow ? '❌ OVERFLOW' : '✅';
                if (data.hasOverflow) {
                    errorCount++;
                    console.error(`${flag} [${vp.label}] ${pg.name}  +${data.scrollWidth - data.clientWidth}px`);
                    data.offenders.forEach((o) =>
                        console.error(`   <${o.tag}> "+${o.overflowBy}px  cls="${o.cls}"`),
                    );
                } else {
                    console.log(`${flag}  [${vp.label}] ${pg.name}`);
                }
            } catch (e) {
                errorCount++;
                console.error(`ERROR [${vp.label}] ${pg.name}: ${e.message}`);
                results.push({ page: pg.name, viewport: vp.label, error: e.message });
            }
            await page.close();
        }
        await context.close();
    }

    writeFileSync('/tmp/overflow-results.json', JSON.stringify(results, null, 2));

    // --- Markdown results table ---
    const pages  = [...new Set(results.map((r) => r.page))];
    const widths = [...new Set(results.map((r) => r.viewport))];

    console.log('\n## Overflow check results (logged in with data)\n');
    console.log('| Page | ' + widths.join(' | ') + ' |');
    console.log('|---|' + widths.map(() => '---').join('|') + '|');
    for (const p of pages) {
        const cells = widths.map((w) => {
            const r = results.find((x) => x.page === p && x.viewport === w);
            if (!r) return '–';
            if (r.error) return '⚠️';
            return r.hasOverflow ? `❌ +${r.scrollWidth - r.clientWidth}px` : '✅';
        });
        console.log(`| ${p} | ${cells.join(' | ')} |`);
    }

    await browser.close();

    if (errorCount > 0) {
        console.error(`\n${errorCount} failure(s) detected.`);
        process.exit(1);
    }
}

run().catch((e) => { console.error(e); process.exit(1); });
