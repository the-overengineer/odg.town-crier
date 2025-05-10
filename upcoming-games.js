const { join } = require('path');

require('dotenv').config({
    path: join(__dirname, '.env.local'),
});

const { getGameLists } = require('./lib/game-crawler');
const { sendApplicationsOpenTonightMessage } = require('./lib/discord-bot');

(async () => {
    const games = await getGameLists();
    const gamesOpening = games.games_open;

    if (gamesOpening.length > 0) {
        const odgName = gamesOpening[0].odg;
        const applicableGames = gamesOpening.filter((game) => game.odg === odgName);

        await sendApplicationsOpenTonightMessage(applicableGames);
    }
})();
