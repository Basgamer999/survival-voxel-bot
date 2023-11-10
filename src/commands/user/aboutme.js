const {
  SlashCommandBuilder,
  UserSelectMenuBuilder,
  InteractionCollector,
} = require("discord.js");
const mysql = require("../../modules/mysql");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("overmij")
    .setDescription("Vul in over Mij")
    .addStringOption((option) =>
      option
        .setName("overmij")
        .setDescription("Je over mij")
        .setRequired(true)
    ),
  async execute(interaction) {
    let about = interaction.options.getString("overmij");
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
      interaction.reply(`Je aboutMe is geupdate`);
    } else {
      mysql.insert({
        table: "users",
        columns: ["id", "aboutMe"],
        data: [interaction.user.id, about],
      });
      interaction.reply(`Je about me is toegevoegd`);
    }
  },
};
