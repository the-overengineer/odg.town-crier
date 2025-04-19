const { join } = require('path');

require('dotenv').config({
    path: join(__dirname, '.env.local'),
});

const { getGameLists } = require('./lib/game-crawler');
const { differenceInDays } = require('date-fns');
const { sendGamesTodayMessage, sendEmptyGamesMessage } = require('./lib/discord-bot');

(async () => {
    const today = process.argv[2] ? new Date(process.argv[2]) : new Date();
    const games = await getGameLists(process.argv[2]);
    const gamesToday = games.games_today;
    const gamesWithOpenSpots = games.games_with_open_spots;

    const openSpotsInTwoDays = gamesWithOpenSpots.filter((game) => {
        const daysDifference = differenceInDays(game.date, today);
        return daysDifference === 2;
    });

    if (gamesToday.length > 0) {
        await sendGamesTodayMessage(gamesToday);
    } else {
        console.log('No games today');
    }

    if (openSpotsInTwoDays.length > 0) {
        await sendEmptyGamesMessage(openSpotsInTwoDays);
    } else {
        console.log('No games with open spots in two days');
    }
})();
