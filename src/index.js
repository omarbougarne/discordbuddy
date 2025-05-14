import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const token = process.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.cooldowns = new Collection();

const commandsFolderPath = join(__dirname, 'commands');
const commandFolders = readdirSync(commandsFolderPath);

for (const folder of commandFolders) {
    const commandsPath = join(commandsFolderPath, folder);
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const fileURL = pathToFileURL(filePath).href;
        
        import(fileURL).then(commandModule => {
            const command = commandModule.default || commandModule;
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`Loaded command: ${command.data.name}`);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }).catch(error => {
            console.error(`Error importing command at ${filePath}:`, error);
        });
    }
}


const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const fileURL = pathToFileURL(filePath).href;
    
    import(fileURL).then(eventModule => {
        const event = eventModule.default || eventModule;
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`Loaded event: ${event.name}`);
    }).catch(error => {
        console.error(`Error importing event at ${filePath}:`, error);
    });
}


client.login(token);