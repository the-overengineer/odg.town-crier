const { join } = require('path');

require('dotenv').config({
    path: join(__dirname, '.env.local'),
});

const { getGameLists } = require('./lib/game-crawler');
const { sendGamesTodayMessage } = require('./lib/discord-bot');

(async () => {
    const games = await getGameLists();
    const gamesToday = games.games_today;

    if (gamesToday.length > 0) {
        await sendGamesTodayMessage(gamesHappeningTomorrow);
    } else {
        console.log('No games today');
    }
})();
