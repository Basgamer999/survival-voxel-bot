const { EmbedBuilder } = require("discord.js");
const mysql = require("./mysql");
const log = require("./log.js");

module.exports = async function (error, interaction, client) {
  const Embed = new EmbedBuilder()
    .setTitle("De code heeft een error.")
    .setDescription(`\`\`\`${error}\`\`\``)
    .addFields({
      name: "Volledige error",
      value: "```" + error.stack.substring(0, 133) + "```",
    })
    .addFields({
      name: "Info",
      value: `De error is opgetreden in command \`${interaction.commandName}\` in het kanaal: <#${interaction.channel.id}> bij gebruiker <@${interaction.user.id}>`,
    })
    .setColor("Red")
    .setTimestamp();
  const channel = await client.channels.fetch(process.env.errorChannelId);
  channel.send({ embeds: [Embed] });
  log.error(
    `Opgetreden in command "${interaction.commandName}" in het kanaal: "${interaction.channel.name}" bij gebruiker "${interaction.user.username}": ${error}`
  );
  mysql.insert({
    table: "errors",
    columns: ["Command", "user", "Error"],
    data: [
      interaction.commandName.toString(),
      interaction.user.id.toString(),
      error.stack.substring(0, 133).toString(),
    ],
  });
  return "The bot got a error please try again later.";
};
