const { join } = require('path');

require('dotenv').config({
    path: join(__dirname, '.env.local'),
});

const { crawlLatestGames } = require('./lib/game-crawler');
const { sendApplicationsOpenTonightMessage } = require('./lib/discord-bot');
const { isInDays } = require('./lib/utils');
const { isMonday, isSaturday } = require('date-fns');

(async () => {
    const games = await crawlLatestGames();
    const gamesNextWeek = games.filter((game) => {
        const today = new Date();

        // Temporary hack for new season
        if (isMonday(today) && game.odg === 'ODG122') {
            return isInDays(game.date, 5);
        }

        if (game.odg === 'ODG122') {
            return false;
        }

        return isSaturday(today) &&
            (isInDays(game.date, 7) || isInDays(game.date, 9));
    });

    if (gamesNextWeek.length > 0) {
        const odgName = gamesNextWeek[0].odg;
        const applicableGames = games.filter((game) => game.odg === odgName);

        await sendApplicationsOpenTonightMessage(applicableGames);
    }
})();
