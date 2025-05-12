const { join } = require('path');

require('dotenv').config({
    path: join(__dirname, '.env.local'),
});

const { sendRawMessage } = require('./lib/discord-bot');
const { readFileSync, existsSync } = require('fs');

(async () => {
    const fileName = process.argv[2];
    const path = join(__dirname, 'messages', `${fileName}.txt`);

    if (!existsSync(path)) {
        console.error(`File ${path} does not exist`);
        process.exit(1);
    }

    const content = readFileSync(path).toString();

    await sendRawMessage(content);
})();
