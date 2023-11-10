const fs = require('fs');
const path = require('path');

const now = new Date();
const timestamp = formatDateTime(now)
const logsDir = path.join('./', 'logs');
const logFileName = path.join(logsDir, `log-${timestamp}.log`);

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}
function removeLastLog() {
    fs.readdir(logsDir, (err, files) => {
        if (err) {
            console.error('Error reading logs directory:', err);
            return;
        }

        if (files.length > process.env.maxLogs) {
            // Sort the log files based on their last modified time
            const sortedFiles = files.map((file) => ({
                file,
                mtime: fs.statSync(path.join(logsDir, file)).mtime.getTime(),
            })).sort((a, b) => b.mtime - a.mtime);

            // Remove the last log file
            const lastLog = sortedFiles[sortedFiles.length - 1].file;
            const lastLogPath = path.join(logsDir, lastLog);
            fs.unlink(lastLogPath, (err) => {
                if (err) {
                    log("ERROR",`Error bij het verwijderen van de laatse log: ${err}`)
                } else {
                    log("INFO",`Laatste log verwijderd: ${lastLog}`)
                }
            });
        }
    });
}

function formatDateTime(dateTime) {
    const year = dateTime.getFullYear();
    const month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
    const day = dateTime.getDate().toString().padStart(2, '0');
    const hour = dateTime.getHours().toString().padStart(2, '0');
    const minute = dateTime.getMinutes().toString().padStart(2, '0');
    const second = dateTime.getSeconds().toString().padStart(2, '0');
    return `${day}-${month}-${year}-${hour};${minute};${second}`;
}

function log(level, message) {
    const errDate = new Date();
    const formattedDate = formatDateTime(errDate);
    const logMessage = `${level} [${formattedDate}] - ${message}\n`;
    if (level === 'ERROR' && process.env.error === 'true') {
        fs.appendFileSync(logFileName, logMessage);
    } else if (level === 'DEBUG' && process.env.debug === 'true') {
        fs.appendFileSync(logFileName, logMessage);
    } else if (level === 'INFO' && process.env.info === 'true') {
        fs.appendFileSync(logFileName, logMessage);
    } else if (level === 'WARN' && process.env.warn === 'true') {
        fs.appendFileSync(logFileName, logMessage);
    }
    removeLastLog();
}

module.exports = {
    error: (message) => log('ERROR', message),
    warn: (message) => log('WARN', message),
    info: (message) => log('INFO', message),
    debug: (message) => log('DEBUG', message),
};
