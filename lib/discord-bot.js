const {
    Client,
    Events,
    GatewayIntentBits,
} = require('discord.js');
const { formatTime } = require('./utils');

const token = process.env.DISCORD_TOKEN;
const notifsChannelName = process.env.DISCORD_NOTIFS_CHANNEL_NAME;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
});

/**
 * 
 * @param {import('./types').Game[]} games 
 * @param {} members 
 */
async function sendSingleMessage(games) {
    client.once(Events.ClientReady, async (botClient) => {
        const members = games.flatMap((game) => game.players);

        let currentMessageText = `**Čujte i počujte!**

Sutra u ${formatTime(games[0].date)} igra se **${games[0].odg}**!

Igre su, nikakvim posebnim redom:

${games.map((game) => describeGame(game)).join('\n\n')}.

Vidimo se sutra!

P.S. Ako želite biti dio kul ekipe koja dobije ping, provjerite jeste li podesili Discord username na https://odgprg.org !`;

        const guild = await botClient.guilds.cache.get(process.env.DISCORD_SERVER_ID);

        // Pre-warms the cache
        await guild.members.fetch();

        for (const member of members) {
            const user = botClient.users.cache.find((user) => {
                return user.username === member.discordName
                    || user.username === member.name
                    || user.globalName === member.discordName
                    || user.globalName === member.name;
            });
            if (user) {
                currentMessageText = currentMessageText.replace(`{{${member.name}}}`, user.toString());
            } else {
                currentMessageText = currentMessageText.replace(`{{${member.name}}}`, `${member.name}`);
            }
        }

        const notificationsChannel = botClient.channels.cache.find((channel) => channel.name === notifsChannelName);

        const message = await notificationsChannel.send(currentMessageText);

        botClient.destroy();
    });
    
    client.login(token);
}

/**
 * 
 * @param {import('./types').Game} game 
 */
function describeGame(game) {
    return `**${game.name}** (GM *${game.gmName}*)
Igrači: ${game.players.map((player) => `{{${player.name}}}`).join(', ')}`;
}

module.exports = {
    sendSingleMessage,
};
