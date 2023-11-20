const { join } = require('path');

require('dotenv').config({
    path: join(__dirname, '.env.local'),
});

const { crawlLatestGames } = require('./lib/game-crawler');
const { sendSingleMessage } = require('./lib/discord-bot');

(async () => {
    const games = await crawlLatestGames();
    await sendSingleMessage(games);
})();
