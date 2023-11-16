const { SlashCommandBuilder, UserSelectMenuBuilder, InteractionCollector } = require('discord.js');
const moment = require('moment');
const dateFormat = 'D-M-YYYY';
const mysqlDateFormat = 'YYYY-MM-DD';
const mysql = require('../../modules/mysql')
module.exports = {
  data: new SlashCommandBuilder()
    .setName("birthday")
    .setDescription("Fill in your birthday")
    .addStringOption((option) =>
      option
        .setName("birthday")
        .setDescription("Fill in your birthday Format: day-month-year")
        .setRequired(true)
    ),
  async execute(interaction) {
    let birthday = interaction.options.getString("birthday");
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
            interaction.reply({content: `Your birthday is updated to: ${birthday}`, ephemeral: true});
        } else {
            mysql.insert({
                table: 'users',
                columns: ['id','birthday'],
                data: [interaction.user.id,mysqlDate]
            })
            interaction.reply({content: `Your birthday is added on date: ${birthday}`, ephemeral: true});
        }
      } else {
        interaction.reply({content:`This is a invalid date, please use the format: day-month-year`, ephemeral: true});
      }
  },
};
