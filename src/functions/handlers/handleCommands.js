const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v10')
const fs = require("fs");
const log = require('../../modules/log');

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync("./src/commands");
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      const { commands, commandArray } = client;
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
      }
    }

    const clientId = process.env.clientId;
    const guildId = process.env.guildId;
    const rest = new REST({ version: '9' }).setToken(process.env.token)
    try {
      log.info('started refreshing application (/) commands');

      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: client.commandArray,
      });

      log.info('All slash commands have been registered without errors');
    } catch (error) {
      console.error(error)
    }
  };
};
