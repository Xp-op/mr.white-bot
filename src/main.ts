import "reflect-metadata";
import { Client } from "discordx";
import { importx } from '@discordx/importer';
import { Intents } from "discord.js";

require('dotenv').config();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ],
    simpleCommand: {
        prefix: 'yo '
    }
});

client.on('messageCreate', async (message) => {
    client.executeCommand(message, {
        caseSensitive: false
    });
})

client.once('ready', async () => {
    console.log(`${client.user?.username} is online`);
})

async function start() {
    await importx(__dirname + "/{events,commands}/**/*.{ts,js}");
    await client.login(process.env.TOKEN ?? '');
}

start();