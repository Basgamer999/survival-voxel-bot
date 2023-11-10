const cron = require("cron");
const path = require("path");
const fs = require("fs-extra");
const mysqldump = require("mysqldump");
const log = require("../../modules/log");

function formatDateTime(dateTime) {
  const year = dateTime.getFullYear();
  const month = (dateTime.getMonth() + 1).toString().padStart(2, "0");
  const day = dateTime.getDate().toString().padStart(2, "0");
  const hour = dateTime.getHours().toString().padStart(2, "0");
  const minute = dateTime.getMinutes().toString().padStart(2, "0");
  const second = dateTime.getSeconds().toString().padStart(2, "0");
  return `${day}-${month}-${year}-${hour}:${minute}:${second}`;
}

async function removeLastBackup(backupDirectory) {
  try {
    const files = await fs.readdir(backupDirectory);

    if (files.length > process.env.maxBackups) {
      // Sort the backup files based on their last modified time
      const sortedFiles = files
        .map((file) => ({
          file,
          mtime: fs.statSync(path.join(backupDirectory, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.mtime - a.mtime);

      // Remove the last backup file
      const lastBackup = sortedFiles[sortedFiles.length - 1].file;
      const lastBackupPath = path.join(backupDirectory, lastBackup);
      await fs.unlink(lastBackupPath);
      log.info(`Last backup file removed: ${lastBackup}`);
    }
  } catch (err) {
    log.error("Error reading backup directory:", err);
  }
}

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    let scheduledMessage = new cron.CronJob("0 * * * *", async () => {
      const date = new Date();
      const formattedDate = formatDateTime(date);
      const backupFileName = `${formattedDate}.sql`;
      const backupDirectory = path.join(__dirname, "../../../backups");
      const backupFilePath = path.join(backupDirectory, backupFileName);

      if (!await fs.exists(backupDirectory)) {
        await fs.mkdirp(backupDirectory);
      }

      try {
        await mysqldump({
          connection: {
            host: process.env.DBhost,
            user: process.env.DBuser,
            password: process.env.DBpass,
            database: process.env.Database,
          },
          dumpToFile: backupFilePath,
        });
        log.info("Backup has been made successfully");

        await removeLastBackup(backupDirectory); // Call the function to remove the last backup
      } catch (error) {
        log.error(`Backup error: ${error}`);
      }
    });

    scheduledMessage.start();
  },
};
