const { SlashCommandBuilder } = require("discord.js");

module.exports = {

    data: SlashCommandBuilder().setName('ping!').setDescription('Replies with pong!'),
    async execute(interaction){
        await interaction.reply('pong');
    },
}