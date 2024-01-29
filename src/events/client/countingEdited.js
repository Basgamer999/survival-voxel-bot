const mysql = require("../../modules/mysql");

module.exports = {
  name: "messageUpdate",
  once: false,
  async execute(message, client) {
    if (message.channel.id !== process.env.countingChannelId) return;
    const result = await mysql.select({
      table: "counting",
    });
    if (result[0].LastMessageID == message.id) {
        message.channel.send(`<@${message.author.id}> edited their message. Counter is still at ${result[0].counter-1}`);
    }
  },
};
