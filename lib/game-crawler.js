const puppeteer = require('puppeteer');

/**
 * @returns {import('./types').Game[]}')}
 */
async function crawlLatestGames() {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await ensureLoggedIn(page);
    const games = await collectCardLinks(page);
    const enrichedGames = [];

    for (const game of games) {
        const enrichedGame = await enrichGameData(page, game);
        enrichedGames.push(enrichedGame);
    }
    
    await browser.close();

    return enrichedGames;
}

/**
 * 
 * @param {import('puppeteer').Page} page 
 */
async function ensureLoggedIn(page) {
    await page.goto('https://odgrpg.org/');

    const loginLinkEl = await page.waitForSelector('[data-drupal-link-system-path="user/login"]');
    
    if (loginLinkEl == null) {
        console.log('Already logged in');
        return;
    }

    await loginLinkEl.click();

    const selector = await page.waitForSelector('#edit-name');
    await selector.isVisible();
    await delay(1000);

    await page.type('#edit-name', process.env.ODG_USERNAME);
    await page.type('#edit-pass', process.env.ODG_PASSWORD);

    console.log('Logging in...');

    const submitButtonEl = await page.$('.js-form-submit');
    await submitButtonEl.click();

    await page.waitForNavigation();

    console.log('Logged in');
}

/**
 * 
 * @param {import ('puppeteer').Page} page 
 */
async function collectCardLinks(page) {
    await page.goto('https://odgrpg.org/');

    const cards = await page.$$('.view-content .card');
    const items = [];

    for (const card of cards) {
        const linkEl = await card.$('a');
        const nameEl = await card.$('.field--name-node-title')
        const odgEl = await card.$('.field--name-field-event');
        const dateEl = await card.$('.field--name-field-date');

        if (!odgEl) {
            continue;
        }

        const item = {
            link: await linkEl.evaluate(el => el.href),
            name: (await nameEl.evaluate(el => el.textContent)).trim(),
            odg: await odgEl.evaluate(el => el.textContent),
            date: parseDate(await dateEl.evaluate(el => el.textContent)),
        };

        items.push(item);
    }

    return items;
}

/**
 * 
 * @param {import('puppeteer').Page} page 
 * @param {{ link: string, name: string, odg: string, date: Date }} game 
 */
async function enrichGameData(page, game) {
    await page.goto(game.link);

    const gmEl = await page.$('.views-field-uid .field-content');
    const playerEls = await page.$$('.view-rng-odg-registrations-admin-view tbody tr');

    const gmName = await gmEl.evaluate(el => el.textContent);
    const players = await Promise.all(playerEls.map(async el => {
        const cells = await el.$$('td');
        const nameRowEl = await cells[0].$('a');
        const discordNameEl = cells[3];
        return {
            name: (await nameRowEl.evaluate(el => el.textContent)).trim(),
            url: await nameRowEl.evaluate(el => el.href),
            discordName: (await discordNameEl.evaluate(el => el.textContent)).trim().replace('N/A', ''),
        };
    }));

    return {
        ...game,
        gmName,
        players,
    };
}

function delay(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration));
}

function parseDate(dateStr) {
    if (!dateStr) {
        return null;
    }

    const parts = dateStr.trim().match(/^\w+, (\d+)\. (\d+)\. (\d+)\. (\d+):(\d+)$/);

    if (!parts) {
        return null;
    }

    const [_, day, month, year, hours, minutes] = parts;

    const date = new Date();

    if (year == null) {
        return null;
    }
    
    date.setFullYear(parseInt(year, 10));
    date.setMonth(parseInt(month, 10) - 1);
    date.setDate(parseInt(day, 10));
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
}

/**
 * 
 * @param {import('puppeteer').Page} page 
 */
function screenshot(page) {
    return page.screenshot({ path: `debug/${new Date().toISOString()}.png` });
}

module.exports = {
    crawlLatestGames,
};
