const { join } = require('path');

require('dotenv').config({
    path: join(__dirname, '.env.local'),
});

const { crawlLatestGames } = require('./lib/game-crawler');
const { sendSingleMessage } = require('./lib/discord-bot');
const { isTomorrow } = require('./lib/utils');

(async () => {
    const games = await crawlLatestGames();
    // Only select games that are tomorrow
    const applicableGames = games.filter((game) => isTomorrow(game.date) || 2 > 1);

    if (applicableGames.length > 0) {
        await sendSingleMessage(applicableGames);
    } else {
        console.log('No games tomorrow, wrapping up');
    }
})();
