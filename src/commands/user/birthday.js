const { SlashCommandBuilder, UserSelectMenuBuilder, InteractionCollector } = require('discord.js');
const moment = require('moment');
const dateFormat = 'D-M-YYYY';
const mysqlDateFormat = 'YYYY-MM-DD';
const mysql = require('../../modules/mysql')
module.exports = {
  data: new SlashCommandBuilder()
    .setName("verjaardag")
    .setDescription("Vul je verjaardag in!")
    .addStringOption((option) =>
      option
        .setName("verjaardag")
        .setDescription("Vul in je verjaardag! Format: dag-maand-jaar")
        .setRequired(true)
    ),
  async execute(interaction) {
    let birthday = interaction.options.getString("verjaardag");
    const isValidDate = moment(birthday, dateFormat, true).isValid();
    if (isValidDate) {
        const mysqlDate = moment(birthday, dateFormat).format(mysqlDateFormat);
        let result = await mysql.select({
            table: 'users',
            data: `WHERE id = ${interaction.user.id}`
        });
        if (result.length >= 1) {
            mysql.update({
                table: 'users',
                column: ['birthday'],
                data: [mysqlDate],
                additionalData: `WHERE id = ${interaction.user.id}`
            })
            interaction.reply(`Je verjaardag is geupdate naar ${birthday}`);
        } else {
            mysql.insert({
                table: 'users',
                columns: ['id','birthday'],
                data: [interaction.user.id,mysqlDate]
            })
            interaction.reply(`Je verjaardag is toegevoegd op datum ${birthday}`);
        }
      } else {
        interaction.reply(`Dit is een invalid date. Vul de datum in als dag-maand-jaar`);
      }
  },
};
