const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const mysql = require("../../modules/mysql");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("counter")
    .setDescription("Get the current counter and other info"),
  async execute(interaction, client) {
    const result = await mysql.select({
      table: "counting",
    });
    if (result.length <= 1) {
      const embed = new EmbedBuilder()
        .setTitle("Counter")
        .setDescription("Displays info about current counter, The record and the last player who counted.")
        .addFields({ name: "Counter", value: (result[0].counter-1).toString() })
        .addFields({ name: "Record", value: result[0].record.toString() })
        .addFields({ name: "Last player", value: `<@${result[0].user.toString()}>` })
        .setColor(process.env.color);
      interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply("Couldn't find any data about the counter.");
    }
  },
};
