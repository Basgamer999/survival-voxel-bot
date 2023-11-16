const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const mysql = require("../../modules/mysql");

function generateButton(page) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("back")
      .setLabel("<< Previous")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(page === 1 ? true : false),
    new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Next >>")
      .setStyle(ButtonStyle.Success)
      .setDisabled(page === 5 ? true : false)
  );
  return row;
}

function generateLeaderboard(result,page) {
  let count = 0;
  for (let x = 1; x < result.length + 1; x++) {
    count = count + result[x - 1].count;
  }
  let leaderboard = "";
  for (let i = 1+(page*10)-10; i < 11+(page*10)-10; i++) {
    let id =
      result[i - 1] && result[i - 1].id !== undefined
        ? `<@${result[i - 1].id}>`
        : "-";
    let userCount =
      result[i - 1] && result[i - 1].count !== undefined
        ? result[i - 1].count
        : "-";
    let procent =
      !isNaN(userCount) && !isNaN(count) && count !== 0
        ? ((userCount / count) * 100).toFixed(2)
        : 0;
    leaderboard = leaderboard + `${i}. ${id}:${userCount} (${procent}%)\n`;
  }
  leaderboard = leaderboard + `\nTotal counted:${count}`;
  return leaderboard;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("counter-leaderboard")
    .setDescription("Get the leaderboard of who counted the most"),
  async execute(interaction, client) {
    const result = await mysql.select({
      table: "games",
      data: "ORDER BY count DESC",
    });
    let page = 1;
    let leaderboard = generateLeaderboard(result,page);
    const row = generateButton(page);
    const embed = new EmbedBuilder()
      .setTitle("Counterleaderboard")
      .setDescription(`page ${page}/5`)
      .addFields({ name: "Leaderboard", value: leaderboard })
      .setColor(process.env.color);
    const message = await interaction.reply({ embeds: [embed], components: [row] });
    const collector = message.createMessageComponentCollector({
      time: 60000,
    });
    collector.on("collect", async (i) => {
      if (i.customId == "back") {
        page = page - 1;
        let leaderboard = generateLeaderboard(result,page);
        const row = generateButton(page);
        const embed = new EmbedBuilder()
          .setTitle("Counterleaderboard")
          .setDescription(`page ${page}/5`)
          .addFields({ name: "Leaderboard", value: leaderboard })
          .setColor(process.env.color);
        await i.update({ embeds: [embed], components: [row] });
      } else if (i.customId == "next") {
        page = page + 1;
        let leaderboard = generateLeaderboard(result,page);
        const row = generateButton(page);
        const embed = new EmbedBuilder()
          .setTitle("Counterleaderboard")
          .setDescription(`page ${page}/5`)
          .addFields({ name: "Leaderboard", value: leaderboard })
          .setColor(process.env.color);
        await i.update({ embeds: [embed], components: [row] });
      }
    })
  },
};
