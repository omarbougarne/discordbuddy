import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


dotenv.config();


const clientId = process.env.Client_Id;
const guildId = process.env.Guild_Id;
const token = process.env.TOKEN;

const commands = [];

const foldersPath = join(__dirname, 'commands');
const commandFolders = readdirSync(foldersPath);


(async () => {
    for (const folder of commandFolders) {
        const commandsPath = join(foldersPath, folder);
        const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = join(commandsPath, file);
            
            const fileURL = pathToFileURL(filePath).href;
            
            const commandModule = await import(fileURL);
            const command = commandModule.default || commandModule;
            
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    const rest = new REST().setToken(token);

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
