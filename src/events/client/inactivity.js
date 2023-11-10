const cron = require('cron')

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        let scheduledMessage = new cron.CronJob("* * * * *", async () => {
            const currentTime = new Date()
            const timeDifference = (currentTime - global.lastExecute) / 1000
            if (timeDifference >= 600) {
                client.user.setStatus('idle');
            }
        })
        scheduledMessage.start()
    }
}