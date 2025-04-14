const apiSecretHeader = process.env.API_SECRET;

async function getGameLists() {
    const response = await fetch('https://yjfqkhspuatsgrwmgkww.supabase.co/functions/v1/notify-bot-scrape',{
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

    return response.json();
}
module.exports = {
    getGameLists,
};
