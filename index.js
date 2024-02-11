const { join } = require('path');

require('dotenv').config({
    path: join(__dirname, '.env.local'),
});

const { crawlLatestGames } = require('./lib/game-crawler');
const { sendGamesTomorrowMessage, sendEmptyGamesInTwoDaysMessage } = require('./lib/discord-bot');
const { isTomorrow, isInDays } = require('./lib/utils');

(async () => {
    const games = await crawlLatestGames();
    // Only select games that are tomorrow
    const gamesHappeningTomorrow = games.filter((game) => isTomorrow(game.date));
    const gamesWithEmptySpotsInTwoDays = games.filter((game) => isInDays(game.date, 2) && game.players.length < game.spots);

    if (gamesHappeningTomorrow.length > 0) {
        await sendGamesTomorrowMessage(gamesHappeningTomorrow);
    } else {
        console.log('No games tomorrow');
    }

    if (gamesWithEmptySpotsInTwoDays.length > 0) {
        await sendEmptyGamesInTwoDaysMessage(gamesWithEmptySpotsInTwoDays);
    } else {
        console.log('No empty games in two days');
    }
})();
