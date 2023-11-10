const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const mysql = require("../../modules/mysql");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Zoek een user op")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("De persoon die je wilt bekijken.")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const target = interaction.options.getUser("target");
    const guild = client.guilds.cache.get(process.env.guildId);
    let user = guild.members.cache.get(target.id).user;
    if (user.bot) return interaction.reply("Deze gebruiker is een bot.");
    const result =
      await mysql.custom(`SELECT COALESCE(users.id, games.id) AS id, games.*, users.*
        FROM games
        LEFT JOIN users ON games.id = users.id
        WHERE users.id = ${user.id} OR games.id = ${user.id};`);
    const embed = new EmbedBuilder()
      .setTitle("Gebruikerinformatie")
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
      .setColor(process.env.color)
      .setThumbnail(user.displayAvatarURL());
    if (result.length == 0) {
      embed.setDescription("Deze gebruiker heeft nog geen data.");
    } else {
      const review = await mysql.select({
        table: "review",
        data: `WHERE user = ${user.id}`,
      });
      let reviews = "";
      if (review.length !== 0) {
        for (let i = 0; i < review.length; i++) {
          let timestamp = `<t:${Math.floor(
            new Date(review[i].timestamp) / 1000
          )}:f>`;
          reviews =
            reviews + `<@${review[i].bij}>:${review[i].review}\n${timestamp}\n`;
        }
      } else {
        reviews = "Geen reviews gevonden";
      }
      embed.setDescription(`Data van <@${user.id}>`);
      embed.addFields({
        name: "Over mij",
        value: result[0].aboutMe || "Geen data gevonden",
      });
      if (result[0].birthday) {
        const birthday = new Date(result[0].birthday).toLocaleDateString(
          "en-GB"
        );
        embed.addFields({ name: "Verjaardag!", value: birthday });
      } else {
        embed.addFields({
          name: "Verjaardag!",
          value: "Geen verjaardag gevonden.",
        });
      }
      embed.addFields({ name: "Review", value: reviews });
      embed.addFields({
        name: "Tellen",
        value: `Deze gebruiker heeft \`${result[0].count || 0}\` keer geteld`,
      });
      embed.addFields({
        name: "2048",
        value: `Hoogste score op 2048: \`${result[0].numberGame || 0}\``,
      });
    }
    interaction.reply({ embeds: [embed] });
  },
};
