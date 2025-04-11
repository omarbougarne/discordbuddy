import { Client, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, readyClient =>{
     console.log(`Client ready ${readyClient.user.tag}`);
     
})
const TOKEN = process.env.TOKEN;
client.login(TOKEN).catch(console.error);