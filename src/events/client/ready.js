const log = require("../../modules/log");
const NetworkSpeed = require("network-speed"); // ES5
const testNetworkSpeed = new NetworkSpeed();

async function getNetworkDownloadSpeed() {
  const baseUrl = "https://eu.httpbin.org/stream-bytes/500000";
  const fileSizeInBytes = 500000;
  const speed = await testNetworkSpeed.checkDownloadSpeed(
    baseUrl,
    fileSizeInBytes
  );
  return speed;
}

async function getNetworkUploadSpeed() {
  const options = {
    hostname: "www.google.com",
    port: 80,
    path: "/catchers/544b09b4599c1d0200000289",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };
  const fileSizeInBytes = 500000;
  const speed = await testNetworkSpeed.checkUploadSpeed(
    options,
    fileSizeInBytes
  );
  return speed;
}

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log("done");
    log.info(`Online as ${client.user.tag}`);
    if (process.env.speedtest == 'true') {
      log.info("Running a speedtest to check internet speed....");
      const down = await getNetworkDownloadSpeed();
      const up = await getNetworkUploadSpeed();
      log.info(
        `Down: ${Math.round(down.bps)}bps. Up: ${Math.round(up.bps)}bps`
      );
    }
  },
};
