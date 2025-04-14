const {
    Client,
    Events,
    GatewayIntentBits,
} = require('discord.js');
const {
    formatTime,
    pluralise,
    getDisplayDate,
} = require('./utils');
const { getISOWeek } = require('date-fns');

const token = process.env.DISCORD_TOKEN;
const notifsChannelName = process.env.DISCORD_NOTIFS_CHANNEL_NAME;

/**
 * 
 * @param {string | undefined} discordName 
 * @param {string | undefined} tag 
 */
function doTagsMatch(discordName, tag) {
    return !!discordName
        && !!tag
        && discordName.includes('#')
        && discordName === tag;
}

/**
 * 
 * @param {string} message 
 * @returns {Promise<import('discord.js').Message>}
 */
async function sendDiscordMessage(message) {
    return new Promise(async (resolve, reject) => {
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
            ],
        });

        client.once(Events.ClientReady, async (botClient) => {
            try {
                /**
                 * @type {import('discord.js').Channel}
                 */
                const notificationsChannel = botClient.channels.cache.find((channel) => channel.name === notifsChannelName);

                /**
                 * @type {import('discord.js').Message}
                 */
                const sentMessage = await notificationsChannel.send(message);

                await botClient.destroy();

                resolve(sentMessage);
            } catch (error) {
                reject(error);
            }
        });

        try {
            await client.login(token);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Inserts player references into a message, without mutating the original.
 * The references in the text need to be of the format "{{player ODG website display name}}""
 * @param {string} message 
 * @param {import('./types').Player} members
 * @returns {Promise<string>}
 */
async function insertPlayerReferences(message, members) {
    return new Promise(async (resolve, reject) => {
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
            ],
        });

        client.once(Events.ClientReady, async (botClient) => {
            try {
                let currentMessageText = `${message}`;
                const guild = await botClient.guilds.cache.get(process.env.DISCORD_SERVER_ID);

                // Pre-warms the cache
                await guild.members.fetch();

                for (const member of members) {
                    const user = botClient.users.cache.find((user) => {
                        return user.username === member.discordName
                            || user.username === member.name
                            || user.globalName === member.discordName
                            || user.globalName === member.name
                            || doTagsMatch(member.discordName, user.tag);
                    });

                    if (user) {
                        currentMessageText = currentMessageText.replace(`{{${member.name}}}`, user.toString());
                    } else {
                        currentMessageText = currentMessageText.replace(`{{${member.name}}}`, `${member.name}`);
                    }
                }

                await botClient.destroy();

                resolve(currentMessageText);
            } catch (error) {
                reject(error);
            }
        });

        try {
            await client.login(token);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 
 * @param {import('./types').Game[]} games 
 */
async function sendGamesTodayMessage(games) {
    const members = games.flatMap((game) => [...game.players, game.gm]);
    const rawMessage = describeEvent(games);
    const formattedMessage = await insertPlayerReferences(rawMessage, members);
    return await sendDiscordMessage(formattedMessage);
}

/**
 * 
 * @param {import('./types').Game[]} games 
 */
async function sendEmptyGamesInTwoDaysMessage(games) {
    const formattedMessage = describeEmptyGames(games);
    return await sendDiscordMessage(formattedMessage);
}

/**
 * 
 * @param {import('./types').Game[]} games 
 */
async function sendApplicationsOpenTonightMessage(games) {
    const formattedMessage = describeOpenApplications(games);
    return await sendDiscordMessage(formattedMessage);
}

/**
 * 
 * @param {import('./types').Game[]} games 
 */
function describeEvent(games) {
    return `**Čujte i počujte!**

Danas u ${formatTime(games[0].date)} igra se **${games[0].odg}**!

Igre su, nikakvim posebnim redom:

${games.map((game) => describeGame(game)).join('\n\n')}.

Vidimo se sutra!

P.S. Ako želite biti dio kul ekipe koja dobije ping, provjerite jeste li podesili Discord username na https://odg.hr/ !`;
}

/**
 * 
 * @param {import('./types').Game[]} games 
 */
function describeEmptyGames(games) {
    const emptyGames = games.filter((game) => game.players.length < game.spots);
    const describedEmptyGames = emptyGames.map((game) => {
        const availableSpots = game.spots - game.players.length;
        return `**${game.name}** (GM *${game.gm.name}*) - **${availableSpots}** ${pluralise('slobodno mjesto | slobodna mjesta | slobodnih mjesta', availableSpots)}`;
    }).join('\n');

    return `**Nepropustiva prilika!**

Za 2 (slovima: dva) dana, u ${formatTime(games[0].date)} igra se **${games[0].odg}**!
Ali, to nije sve! Još uvijek ima slobodnih mjesta!

Trenutna ponuda:
${describedEmptyGames}

Nazovite 0800-ODG-ODG (a ako to ne upali odite na website i kliknite Prijavi) i rezervirajte svoje mjesto!

P.S. Ako želite biti dio kul ekipe koja sutra dobije ping u podsjetniku, provjerite jeste li podesili Discord username na https://odgrpg.org/ !`;
}

/**
 * 
 * @param {import('./types').Game[]} games 
 */
function describeOpenApplications(games) {
    const describedGames = games.map((game) => {
        return `- **${game.name}** - ${getDisplayDate(game.date)} u ${formatTime(game.date)}`;
    }).join('\n');

    const whichWeek = games.some((game) => getISOWeek(game.date) === getISOWeek(new Date()))
        ? '_ovog_'
        : 'idućeg';

    return `@everyone **Dobri narode, danas je velik i bitan dan dan!**

Na današnji dan u **18:30** otvaraju se prijave za vaš i naš **${games[0].odg}**, koji se igra od ${whichWeek} tjedna!

Igre u ponudi su:
${describedGames}

Više detalja na: ${games[0].odgLink}`;
}

/**
 * 
 * @param {import('./types').Game} game 
 */
function describeGame(game) {
    return `**${game.name}** (GM *{{${game.gm.name}}}*)
Igrači: ${game.players.map((player) => `{{${player.name}}}`).join(', ')}`;
}

module.exports = {
    sendGamesTodayMessage,
    sendEmptyGamesInTwoDaysMessage,
    sendApplicationsOpenTonightMessage,
};
