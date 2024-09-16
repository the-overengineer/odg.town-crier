const { join } = require('path');

require('dotenv').config({
    path: join(__dirname, '.env.local'),
});

const { crawlLatestGames } = require('./lib/game-crawler');
const { sendApplicationsOpenTonightMessage } = require('./lib/discord-bot');
const { isInDays, isFriday } = require('./lib/utils');
const { isMonday } = require('date-fns');

(async () => {
    const games = await crawlLatestGames();
    const gamesNextWeek = games.filter((game) => {
        const today = new Date();

        // Temporary hack for new season
        if (isMonday(today) && game.odg === 'ODG122') {
            return isInDays(game.date, 5);
        }

        return isFriday(today) &&
            (isInDays(game.date, 8) || isInDays(game.date, 10));
    });

    if (gamesNextWeek.length > 0) {
        const odgName = gamesNextWeek[0].odg;
        const applicableGames = games.filter((game) => game.odg === odgName);

        await sendApplicationsOpenTonightMessage(applicableGames);
    }
})();
