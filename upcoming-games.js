const { join } = require('path');

require('dotenv').config({
    path: join(__dirname, '.env.local'),
});

const { crawlLatestGames } = require('./lib/game-crawler');
const { sendApplicationsOpenTonightMessage } = require('./lib/discord-bot');
const { isInDays } = require('./lib/utils');

(async () => {
    const games = await crawlLatestGames();
    const gamesNextWeek = games.filter((game) => isInDays(game.date, 8));

    if (gamesNextWeek.length > 0) {
        const odgName = gamesNextWeek[0].odg;
        const applicableGames = games.filter((game) => game.odg === odgName);

        await sendApplicationsOpenTonightMessage(applicableGames);
    }
})();
