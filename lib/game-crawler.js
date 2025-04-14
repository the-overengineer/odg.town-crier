const apiSecretHeader = process.env.API_SECRET;

async function getGameLists(date) {
    const queryParams = date ? `?date=${date}` : '';
    const response = await fetch(`https://yjfqkhspuatsgrwmgkww.supabase.co/functions/v1/notify-bot-scrape${queryParams}`,{
        method: 'GET',
        headers: {
            'Authorization': apiSecretHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch game lists: ${response.statusText}`);
    }

    const data = await response.json();

    return {
        games_open: parseGameData(data.games_open),
        games_today: parseGameData(data.games_today),
        games_with_open_spots: parseGameData(data.games_with_open_spots),  
    };
}

function parseGameData(data) {
    return data.map((it) => ({
        ...it,
        date: new Date(it.date),
    }));
}
module.exports = {
    getGameLists,
};
