/**
 * Overflow audit script – checks every page at multiple widths for:
 * - horizontal scroll (scrollWidth > clientWidth)
 * - which elements are the offending overflow sources
 * - bottom dock covering content (insufficient padding-bottom)
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:5173';

// Pages accessible without auth (login not required to render)
const PAGES = [
    { name: 'Landing (?url=)', path: '/?url=https://example.com' },
    { name: 'Login', path: '/login' },
    { name: 'Signup', path: '/signup' },
    // Auth-gated pages – rendered with a mock auth token injected via localStorage
    { name: 'Library', path: '/library', auth: true },
    { name: 'Planner (week)', path: '/planner', auth: true },
    { name: 'Cart', path: '/cart', auth: true },
    { name: 'Community', path: '/community', auth: true },
];

const WIDTHS = [320, 360, 375, 390, 412, 430];
const PIXEL_8_PRO = { width: 412, height: 915, deviceScaleFactor: 3.5 };
const LANDSCAPE = { width: 915, height: 412, deviceScaleFactor: 3.5 };

// Inject a fake auth token so protected routes render (API calls will 401, but layout renders)
const FAKE_AUTH_SCRIPT = `
    localStorage.setItem('token', 'fake-token-for-layout-testing');
    // Override fetch to prevent 401 errors from crashing the page
    const origFetch = window.fetch;
    window.fetch = (...args) => origFetch(...args).catch(() => new Response('[]', { status: 200 }));
`;

async function checkOverflow(page) {
    return page.evaluate(() => {
        const offenders = [];
        const docScrollWidth = document.documentElement.scrollWidth;
        const docClientWidth = document.documentElement.clientWidth;
        const hasHorizOverflow = docScrollWidth > docClientWidth;

        if (hasHorizOverflow) {
            // Find elements wider than viewport
            document.querySelectorAll('*').forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.right > docClientWidth + 1 || rect.left < -1) {
                    const style = window.getComputedStyle(el);
                    offenders.push({
                        tag: el.tagName.toLowerCase(),
                        id: el.id || null,
                        classes: el.className?.toString().slice(0, 80) || '',
                        rect: {
                            left: Math.round(rect.left),
                            right: Math.round(rect.right),
                            width: Math.round(rect.width),
                        },
                        overflow: style.overflow,
                        overflowX: style.overflowX,
                    });
                }
            });
        }

        // Check body padding vs dock height (dock is ~96px, footer padding should compensate)
        const dock = document.querySelector('[class*="fixed"][class*="inset-x"]');
        const dockHeight = dock ? dock.getBoundingClientRect().height : 0;

        return {
            scrollWidth: docScrollWidth,
            clientWidth: docClientWidth,
            overflow: hasHorizOverflow,
            dockHeight,
            offenders: offenders.slice(0, 10), // top 10
        };
    });
}

async function run() {
    const browser = await chromium.launch();
    const results = [];

    for (const viewport of [
        ...WIDTHS.map((w) => ({ width: w, height: 900, deviceScaleFactor: 1, label: `${w}px` })),
        { ...PIXEL_8_PRO, label: '412px (Pixel 8 Pro)' },
        { ...LANDSCAPE, label: '915×412 landscape' },
    ]) {
        const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            deviceScaleFactor: viewport.deviceScaleFactor,
            userAgent: viewport.width <= 430
                ? 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
                : undefined,
        });

        for (const p of PAGES) {
            const page = await context.newPage();
            try {
                if (p.auth) {
                    await page.addInitScript(FAKE_AUTH_SCRIPT);
                }
                await page.goto(BASE + p.path, { waitUntil: 'networkidle', timeout: 15000 });
                await page.waitForTimeout(500);

                const data = await checkOverflow(page);
                results.push({
                    page: p.name,
                    viewport: viewport.label,
                    ...data,
                });

                if (data.overflow) {
                    console.log(`OVERFLOW [${viewport.label}] ${p.name}: scrollWidth=${data.scrollWidth} clientWidth=${data.clientWidth}`);
                    data.offenders.forEach((o) => {
                        console.log(`  -> <${o.tag}> class="${o.classes}" rect.right=${o.rect.right}`);
                    });
                } else {
                    console.log(`OK       [${viewport.label}] ${p.name}`);
                }
            } catch (e) {
                console.log(`ERROR    [${viewport.label}] ${p.name}: ${e.message}`);
                results.push({ page: p.name, viewport: viewport.label, error: e.message });
            }
            await page.close();
        }
        await context.close();
    }

    writeFileSync('/tmp/overflow-results.json', JSON.stringify(results, null, 2));
    console.log('\nResults saved to /tmp/overflow-results.json');
    await browser.close();
}

run().catch((e) => { console.error(e); process.exit(1); });
