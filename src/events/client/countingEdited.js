const mysql = require("../../modules/mysql");

module.exports = {
  name: "messageUpdate",
  once: false,
  async execute(message, client) {
    const result = await mysql.select({
      table: "counting",
    });
    if (result[0].LastMessageID == message.id) {
        message.channel.send(`<@${message.author.id}> deleted their message. Counter is still at ${result[0].counter-1}`);
    }
  },
};
