const mysql = require("../../modules/mysql");
const log = require("../../modules/log");

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message, client) {
    if (message.author.bot) return;
    if (message.channel.id == process.env.countingChannelId) {
      const start = new Date();
      if (!isNaN(message.content) && !message.content == "") {
        let result = await mysql.select({
          table: "counting",
          data: "LIMIT 1",
        });
        if (result.length >= 1) {
          let counter = Number(result[0].counter);
          let user = result[0].user;
          if (message.content == counter && message.author.id !== user) {
            if (message.content == 100) {
              message.react("💯");
            } else if (message.content == 69) {
              message.react("😉");
            } else {
              message.react("✅");
            }
            let user = await mysql.select({
              table: "games",
              data: `WHERE id = ${message.author.id} LIMIT 1`,
            });
            if (user.length >= 1) {
              mysql.update({
                table: "games",
                column: ["count"],
                data: [user[0].count + 1],
                additionalData: `WHERE id = ${message.author.id}`,
              });
            } else {
              await mysql.insert({
                table: "games",
                columns: ["id", "count"],
                data: [message.author.id, 1],
              });
            }
            mysql.update({
              table: "counting",
              column: ["user", "counter","LastMessageID"],
              data: [message.author.id, counter + 1, message.id],
              additionalData: `WHERE counter = ${counter}`,
            });
          } else {
            message.react("❌");
            message.reply("Failed, next number is 1");
            let user = await mysql.select({
              table: "games",
              data: `WHERE id = ${message.author.id} LIMIT 1`,
            });
            if (user.length >= 1) {
              mysql.update({
                table: "games",
                column: ["fails"],
                data: [Number(user[0].fails) + 1],
                additionalData: `WHERE id = ${user[0].id}`,
              });	
            } else {
              await mysql.insert({
                table: "games",
                columns: ["id", "fails"],
                data: [message.author.id, 1],
              });
            }
            if (result[0].record < counter) {
              mysql.update({
                table: "counting",
                column: ["user", "counter", "record"],
                data: ["0", "1", counter - 1],
                additionalData: `WHERE counter = ${counter}`,
              });
              message.channel.setTopic(`Record: ${counter - 1}`);
            } else {
              mysql.update({
                table: "counting",
                column: ["user", "counter"],
                data: ["0", "1"],
                additionalData: `WHERE counter = ${counter}`,
              });
            }
          }
        } else {
          if (message.content == 1) {
            await mysql.insert({
              table: "counting",
              columns: ["user", "counter", "record"],
              data: [message.author.id, "1", "1"],
            });
          } else {
            message.react("❌");
            message.reply("Failed, next number is 1");
          }
        }
      }
      const end = new Date();
      log.debug(`counting took ${end - start}ms`);
      global.lastExecute = new Date();
      client.user.setStatus("online");
    }
  },
};
