const cron = require('cron');
const mysql = require("../../modules/mysql");
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    let scheduledMessage = new cron.CronJob("* * * * *", async () => {
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth()+1;
        const result = await mysql.custom(`SELECT *
        FROM users
        WHERE DAY(birthday) = ${day} AND MONTH(birthday) = ${month};
        `)
        if (result.length < 1) return;
        const birthday = new Date(result[0].birthday).getFullYear();
        const age = date.getFullYear() - birthday;
        const channel = client.channels.cache.get(process.env.birthdayChannelId);
        const embed = new EmbedBuilder()
            .setTitle('Happy birthday!')
            .setDescription(`Wish <@${result[0].id}> a happy birthday in <#997214599881425039>! \nThey are now ${age} years old!`)
            .setColor(process.env.color)
        channel.send({embeds: [embed]});
        let user = await client.users.fetch(result[0].id);
        user.send(`Happy birthday <@${result[0].id}>! Have a great day! \nFrom the staff team!`);
    });
    scheduledMessage.start()
  },
};
