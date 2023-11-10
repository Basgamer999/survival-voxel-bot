const errorLog = require("../../modules/error.js");
const log = require("../../modules/log");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        const start = new Date();
        await command.execute(interaction, client);
        const end = new Date();
        log.debug(
          `Command ${interaction.commandName} is successvol uitgevoerd.`
        );
        log.debug(`Command ${interaction.commandName} duurde ${end - start}ms`);
        global.lastExecute = new Date();
        client.user.setStatus('online');
      } catch (error) {
        errorLog(error, interaction, client);
        await interaction.reply({
          content:
            "Er is een error opgetreden sorry voor het ongemak. \nBas is hier over geinformeerd en zou het proberen het probleem op te lossen",
          ephemeral: true,
        });
      }
    }
  },
};
