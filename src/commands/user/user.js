const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const mysql = require("../../modules/mysql");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Find a user")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The person you want to find.")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const target = interaction.options.getUser("target");
    const guild = client.guilds.cache.get(process.env.guildId);
    let user = guild.members.cache.get(target.id).user;
    if (user.bot) return interaction.reply("This user is a bot.");
    const result =
      await mysql.custom(`SELECT COALESCE(users.id, games.id) AS id, games.*, users.*
      FROM games
      LEFT JOIN users ON games.id = users.id
      WHERE games.id = ${user.id} OR users.id = ${user.id}
      UNION
      SELECT COALESCE(users.id, games.id) AS id, games.*, users.*
      FROM games
      RIGHT JOIN users ON games.id = users.id
      WHERE games.id = ${user.id} OR users.id = ${user.id}     
      `);
    const embed = new EmbedBuilder()
      .setTitle("Userinfo")
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
      .setColor(process.env.color)
      .setThumbnail(user.displayAvatarURL());
    if (result.length == 0) {
      embed.setDescription("No data found.");
    } else {
      embed.setDescription(`Data of <@${user.id}>`);
      embed.addFields({
        name: "About me",
        value: result[0].aboutMe || "No data found.",
      });
      if (result[0].birthday) {
        const birthday = new Date(result[0].birthday).toLocaleDateString(
          "en-GB"
        );
        embed.addFields({ name: "Birthday", value: birthday });
      } else {
        embed.addFields({
          name: "Birthday",
          value: "No birthday found.",
        });
      }
      embed.addFields({
        name: "Counting",
        value: `This user has \`${result[0].count || 0}\` times counted.`,
      });
      embed.addFields({
        name: "2048",
        value: `Highest score on 2048: \`${result[0].numberGame || 0}\``,
      });
    }
    interaction.reply({ embeds: [embed] });
  },
};
