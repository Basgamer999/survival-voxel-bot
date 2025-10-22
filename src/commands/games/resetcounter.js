const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const mysql = require("../../modules/mysql");

const AUTHORIZED_USER_ID = "665544384233603073";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetcounter")
    .setDescription("Reset the counter to a specific number (Admin only)")
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("The number to reset the counter to")
        .setRequired(true)
        .setMinValue(1)
    ),
  async execute(interaction, client) {
    // Check if user is authorized
    if (interaction.user.id !== AUTHORIZED_USER_ID) {
      return interaction.reply({
        content: "❌ You are not authorized to use this command.",
        ephemeral: true,
      });
    }

    const newCounterValue = interaction.options.getInteger("number");

    // Get current counter value from database
    const result = await mysql.select({
      table: "counting",
    });

    if (result.length === 0) {
      return interaction.reply({
        content: "❌ Couldn't find any data about the counter in the database.",
        ephemeral: true,
      });
    }

    const currentCounter = result[0].counter - 1;
    const currentRecord = result[0].record;
    const lastUser = result[0].user;

    // Create confirmation embed
    const embed = new EmbedBuilder()
      .setTitle("⚠️ Reset Counter Confirmation")
      .setDescription(
        `You are about to reset the counter. Please review the details below and confirm.`
      )
      .addFields(
        { name: "Current Counter", value: currentCounter.toString(), inline: true },
        { name: "Current Record", value: currentRecord.toString(), inline: true },
        { name: "Last User", value: `<@${lastUser}>`, inline: true },
        { name: "\u200B", value: "\u200B", inline: false },
        { name: "New Counter Value", value: `**${newCounterValue}**`, inline: true }
      )
      .setColor("#FF0000")
      .setFooter({ text: "This action cannot be undone!" })
      .setTimestamp();

    // Create confirmation button
    const confirmButton = new ButtonBuilder()
      .setCustomId(`confirm_reset_${newCounterValue}`)
      .setLabel(`Yes, I am sure I want to switch it to ${newCounterValue}`)
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel_reset")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

    const response = await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    // Create collector for button interactions
    const collectorFilter = (i) => i.user.id === interaction.user.id;

    try {
      const confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 60000,
      });

      if (confirmation.customId === `confirm_reset_${newCounterValue}`) {
        // Update the database
        await mysql.update({
          table: "counting",
          column: ["counter"],
          data: [newCounterValue + 1],
          additionalData: `WHERE counter = ${result[0].counter}`,
        });

        const successEmbed = new EmbedBuilder()
          .setTitle("✅ Counter Reset Successfully")
          .setDescription(
            `The counter has been reset from **${currentCounter}** to **${newCounterValue}**.`
          )
          .addFields(
            { name: "Previous Counter", value: currentCounter.toString(), inline: true },
            { name: "New Counter", value: newCounterValue.toString(), inline: true }
          )
          .setColor("#00FF00")
          .setTimestamp();

        await confirmation.update({
          embeds: [successEmbed],
          components: [],
        });
      } else if (confirmation.customId === "cancel_reset") {
        const cancelEmbed = new EmbedBuilder()
          .setTitle("❌ Counter Reset Cancelled")
          .setDescription("The counter reset operation has been cancelled.")
          .setColor("#808080")
          .setTimestamp();

        await confirmation.update({
          embeds: [cancelEmbed],
          components: [],
        });
      }
    } catch (e) {
      // Timeout - no response received
      const timeoutEmbed = new EmbedBuilder()
        .setTitle("⏱️ Counter Reset Timed Out")
        .setDescription(
          "The confirmation timed out. No changes were made to the counter."
        )
        .setColor("#808080")
        .setTimestamp();

      await interaction.editReply({
        embeds: [timeoutEmbed],
        components: [],
      });
    }
  },
};
