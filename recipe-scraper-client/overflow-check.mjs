/**
 * Logged-in overflow audit — Playwright script.
 *
 * Auth is mocked at network level via page.route() (not addInitScript), so
 * the AuthContext's tryRefresh() + api.get('/auth/me') calls succeed and
 * every auth-gated page renders with full layout.
 *
 * Run:  npm run overflow-check
 *
 * Results are written to /tmp/overflow-results.json and printed as a
 * markdown table to stdout.
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:5173';

const PAGES = [
    { name: 'Landing (?url=)',      path: '/?url=https://example.com',  auth: false },
    { name: 'Login',                path: '/login',                      auth: false },
    { name: 'Signup',               path: '/signup',                     auth: false },
    { name: 'Library',              path: '/library',                    auth: true  },
    { name: 'Planner (week)',       path: '/planner',                    auth: true  },
    { name: 'Cart',                 path: '/cart',                       auth: true  },
    { name: 'Community',            path: '/community',                  auth: true  },
];

const VIEWPORTS = [
    { label: '320px',              w: 320,  h: 900,  dpr: 1   },
    { label: '360px',              w: 360,  h: 900,  dpr: 1   },
    { label: '375px',              w: 375,  h: 900,  dpr: 1   },
    { label: '390px',              w: 390,  h: 900,  dpr: 1   },
    { label: '412px (Pixel 8 Pro)',w: 412,  h: 915,  dpr: 3.5 },
    { label: '430px',              w: 430,  h: 900,  dpr: 1   },
    { label: '915×412 landscape',  w: 915,  h: 412,  dpr: 3.5 },
];

const UA_MOBILE =
    'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

/**
 * Register network-level auth mocks on a page.
 * Intercepts /auth/refresh → returns a fake access token (as the API does).
 * Intercepts /auth/me      → returns a fake AuthUser.
 * Intercepts data routes   → returns empty arrays so loading states resolve.
 */
async function mockAuth(page) {
    await page.route('**/api/v1/auth/refresh', (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: { accessToken: 'fake-token' } }),
        }),
    );
    await page.route('**/api/v1/auth/me', (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                data: { _id: '1', email: 'test@test.de', name: 'Test', role: 'user' },
            }),
        }),
    );
    // Data endpoints — empty so pages render without API errors
    await page.route('**/api/v1/**', (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: [] }),
        }),
    );
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
                        cls: el.className?.toString().slice(0, 60) ?? '',
                        right: Math.round(rect.right),
                        left: Math.round(rect.left),
                    });
                }
            });
        }

        return { scrollWidth: docScrollWidth, clientWidth: docClientWidth, hasOverflow, offenders: offenders.slice(0, 5) };
    });
}

async function run() {
    const browser = await chromium.launch();
    const results = [];

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

                const data = await checkOverflow(page);
                results.push({ page: pg.name, viewport: vp.label, ...data });

                const flag = data.hasOverflow ? '❌ OVERFLOW' : '✅';
                if (data.hasOverflow) {
                    console.log(`${flag} [${vp.label}] ${pg.name}  scrollWidth=${data.scrollWidth} clientWidth=${data.clientWidth}`);
                    data.offenders.forEach((o) =>
                        console.log(`   <${o.tag}> cls="${o.cls}"  right=${o.right}`),
                    );
                } else {
                    console.log(`${flag}  [${vp.label}] ${pg.name}`);
                }
            } catch (e) {
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

    console.log('\n## Overflow check results (logged in)\n');
    console.log('| Page | ' + widths.join(' | ') + ' |');
    console.log('|---|' + widths.map(() => '---').join('|') + '|');
    for (const p of pages) {
        const cells = widths.map((w) => {
            const r = results.find((x) => x.page === p && x.viewport === w);
            if (!r) return '–';
            if (r.error) return '⚠️ err';
            return r.hasOverflow ? '❌' : '✅';
        });
        console.log(`| ${p} | ${cells.join(' | ')} |`);
    }

    await browser.close();
}

run().catch((e) => { console.error(e); process.exit(1); });
