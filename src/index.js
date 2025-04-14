import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readdirSync } from 'node:fs';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, readyClient => {
    console.log(`Client ready ${readyClient.user.tag}`);
});

const TOKEN = process.env.TOKEN;
client.login(TOKEN).catch(console.error);

client.commands = new Collection();

const foldersPath = join(__dirname, 'commands');
const commandFolders = readdirSync(foldersPath);


for (const folder of commandFolders) {
    const commandsPath = join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        
        import(filePath).then(commandModule => {
            const command = commandModule.default || commandModule;
            if('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }).catch(error => {
            console.error(`Error importing command at ${filePath}:`, error);
        });
    }
}

client.on(Events.InteractionCreate, async interaction => {
     if(!interaction.isChatInputCommand()) return;
     const command = interaction.client.commands.get(interaction, commandName);

     if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
     try{
          await command.execute(interaction);
     } catch (error){
          console.error(error);
          if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
     }
	console.log(interaction);
});