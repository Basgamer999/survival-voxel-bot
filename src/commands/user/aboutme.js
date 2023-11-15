const {
  SlashCommandBuilder,
  UserSelectMenuBuilder,
  InteractionCollector,
} = require("discord.js");
const mysql = require("../../modules/mysql");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("aboutme")
    .setDescription("Fill in your aboutme")
    .addStringOption((option) =>
      option
        .setName("aboutme")
        .setDescription("Fill in your aboutme")
        .setRequired(true)
    ),
  async execute(interaction) {
    let about = interaction.options.getString("aboutme");
    let result = await mysql.select({
      table: "users",
      data: `WHERE id = ${interaction.user.id}`,
    });
    if (result.length >= 1) {
      mysql.update({
        table: "users",
        column: ["aboutMe"],
        data: [about],
        additionalData: `WHERE id = ${interaction.user.id}`,
      });
      interaction.reply({content:`Your aboutme has been updated`, ephemeral: true});
    } else {
      mysql.insert({
        table: "users",
        columns: ["id", "aboutMe"],
        data: [interaction.user.id, about],
      });
      interaction.reply({content: `Your aboutme has been added.`, ephemeral: true});
    }
  },
};
