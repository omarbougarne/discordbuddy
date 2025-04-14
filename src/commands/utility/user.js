const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: SlashCommandBuilder().setName('user').setDescription('Provides information about the user.'),
    async execute(interaction){
        await interaction.reply(`This command was run by ${interaction.user.username} who joined ${interaction.member.joinedAt}.` )
    }
}