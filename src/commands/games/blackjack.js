const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

const suits = ["♥️", "♦️", "♠️", "♣️"];
const ranks = [
  "Aas",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "Boer",
  "Damen",
  "Koning",
];

function buttons() {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("pas")
      .setLabel("Pas")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("hit")
      .setLabel("Hit")
      .setStyle(ButtonStyle.Success)
  );
  return row;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("Speel een potje blackjack"),
  async execute(interaction, client) {
    const deck = [];
    for (let suit of suits) {
      for (let rank of ranks) {
        deck.push({ suit: suit, rank: rank });
      }
    }
    deck.sort(() => Math.random() - 0.5);
    let usedcarts = [];
    let points = [];
    for (let i = 0; i < 4; i++) {
      usedcarts[i] = deck[i].suit + " " + deck[i].rank;
      if (
        deck[i].rank == "Boer" ||
        deck[i].rank == "Damen" ||
        deck[i].rank == "Koning"
      ) {
        points[i] = 10;
      } else if (deck[i].rank == "Aas") {
        points[i] = 11;
      } else {
        points[i] = Number(deck[i].rank);
      }
    }
    let yourdeck = usedcarts[2] + "\n" + usedcarts[3];
    let dealer = usedcarts[0] + "\n" + "Dichte kaart";
    let playerpoints = points[2] + points[3];
    let dealerpoints = points[0] + points[1];
    const Embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Blackjack")
      .setDescription(`Welkom bij blackjack <@${interaction.member.id}>`)
      .setFooter({ text: "Geschreven door: Basgamer999#9392" })
      .addFields({
        name: "Jouw hand:",
        value: `${yourdeck}\naantal punten: ${playerpoints}`,
      })
      .addFields({
        name: "Dealer:",
        value: `${dealer}\naantal punten: ${points[0]}`,
      });
    const row = buttons();
    let message = await interaction.reply({
      embeds: [Embed],
      components: [row],
    });

    const collector = message.createMessageComponentCollector({
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId == "pas") {
        if (i.member.id == interaction.member.id) {
          dealer = usedcarts[0] + usedcarts[1];
          const Embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("Blackjack")
            .setDescription(`Welkom bij blackjack <@${interaction.member.id}>`)
            .setFooter({ text: "Geschreven door: Basgamer999#9392" })
            .addFields({
              name: "Jouw hand:",
              value: `${yourdeck}\naantal punten: ${playerpoints}`,
            })
            .addFields({
              name: "Dealer:",
              value: `${dealer}\naantal punten: ${dealerpoints}`,
            });
          interaction.reply({ embeds: [Embed], components: [row] });
        }
      }
    });
  },
};
