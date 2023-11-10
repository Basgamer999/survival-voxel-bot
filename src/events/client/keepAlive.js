const mysql = require('../../modules/mysql')
const log = require('../../modules/log')
const cron = require('cron')
module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        let scheduledMessage = new cron.CronJob("0 * * * *", async () => {
            const result = await mysql.select({
                table: "counting",
            });
            if (result.length == 0) {
                log.warn('Database keep alive returned a empty result.')
            } else {
                log.info('Database is healthy.')
            }
        });

        scheduledMessage.start();
    }
}