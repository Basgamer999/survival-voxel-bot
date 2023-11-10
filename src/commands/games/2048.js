// 2048 game
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const { createCanvas } = require("canvas");
const mysql = require("../../modules/mysql");

async function Embed(gameboard, score) {
  const embed = new EmbedBuilder()
    .setTitle("2048")
    .setDescription(
      "Welcome to 2048! Use the arrow buttons to play the game. Press the red button to give up."
    )
    .setImage("attachment://Buffer.png")
    .setColor(process.env.color)
    .addFields({ name: "Score", value: score.toString() });
  return embed;
}

const cellColors = {
  0: "#cccccc", // Gray for empty cells
  2: "#eee4da", // Light beige for cells with value 2
  4: "#ede0c8", // Beige for cells with value 4
  8: "#f2b179", // Light orange for cells with value 8
  16: "#f59563", // Orange for cells with value 16
  32: "#f67c5f", // Dark orange for cells with value 32
  64: "#f65e3b", // Reddish orange for cells with value 64
  128: "#edcf72", // Light yellow for cells with value 128
  256: "#edcc61", // Yellow for cells with value 256
  512: "#edc850", // Dark yellow for cells with value 512
  1024: "#edc53f", // Golden yellow for cells with value 1024
};

async function generateGameboardImage(gameboard) {
  const canvasSize = 360; // Adjust this value to match the size of the gameboard
  const cellSize = 80;
  const borderWidth = 10; // Adjust this value to control the border size

  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext("2d");

  // Draw the background color for each cell
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < gameboard.length; i++) {
    for (let j = 0; j < gameboard[i].length; j++) {
      const cellValue = gameboard[i][j];
      const x = j * (cellSize + borderWidth);
      const y = i * (cellSize + borderWidth);

      // Get the background color based on the cell value
      const backgroundColor = cellColors[cellValue] || "#000000"; // Default color for unknown values

      // Draw the background color rectangle
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(x, y, cellSize, cellSize);

      // Draw the cell value
      if (cellValue !== 0) {
        ctx.fillStyle = "#000000"; // Black text color for non-zero values
      } else {
        ctx.fillStyle = "#cccccc"; // Light gray text color for zero values
      }
      ctx.fillText(cellValue.toString(), x + cellSize / 2, y + cellSize / 2);
    }
  }

  // Convert the canvas to a buffer
  const buffer = canvas.toBuffer("image/png");
  const image = new AttachmentBuilder(buffer, { name: "Buffer.png" });
  return image;
}

function moveLeft(gameboard) {
  for (let row of gameboard) {
    let nonZeros = row.filter((element) => element !== 0);
    let zeros = Array(row.length - nonZeros.length).fill(0);
    row.length = 0;
    Array.prototype.push.apply(row, nonZeros.concat(zeros));

    for (let i = 0; i < row.length - 1; i++) {
      if (row[i] === row[i + 1]) {
        row[i] *= 2;
        row[i + 1] = 0;
      }
    }

    nonZeros = row.filter((element) => element !== 0);
    zeros = Array(row.length - nonZeros.length).fill(0);
    row.length = 0;
    Array.prototype.push.apply(row, nonZeros.concat(zeros));
  }
}

function moveRight(gameboard) {
  for (let row of gameboard) {
    row.reverse();
  }
  moveLeft(gameboard);
  for (let row of gameboard) {
    row.reverse();
  }
}

function moveUp(gameboard) {
  transposeGameboard(gameboard);
  moveLeft(gameboard);
  transposeGameboard(gameboard);
}

function moveDown(gameboard) {
  transposeGameboard(gameboard);
  moveRight(gameboard);
  transposeGameboard(gameboard);
}

function transposeGameboard(gameboard) {
  const transposedGameboard = gameboard[0].map((_, i) =>
    gameboard.map((row) => row[i])
  );
  gameboard.length = 0;
  Array.prototype.push.apply(gameboard, transposedGameboard);
}

async function placeRandomNumber(gameboard) {
  let emptySpots = [];

  // Find empty spots
  for (let i = 0; i < gameboard.length; i++) {
    for (let j = 0; j < gameboard[i].length; j++) {
      if (gameboard[i][j] === 0) {
        emptySpots.push({ row: i, col: j });
      }
    }
  }

  if (emptySpots.length === 0) {
    return true;
  } else {
    const randomSpot =
      emptySpots[Math.floor(Math.random() * emptySpots.length)];
    const newValue = Math.random() < 0.9 ? 2 : 4;
    gameboard[randomSpot.row][randomSpot.col] = newValue;
    return false;
  }
}

function calculateScore(gameboard) {
  let score = 0;
  for (let i = 0; i < gameboard.length; i++) {
    for (let j = 0; j < gameboard[i].length; j++) {
      const cellValue = gameboard[i][j];
      score += cellValue * cellValue; // Use a weighted score based on the square of the cell value
    }
  }
  return score;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("2048")
    .setDescription("Play a game of 2048"),
  async execute(interaction, client) {
    let gameboard = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    let score = 0;
    placeRandomNumber(gameboard);
    placeRandomNumber(gameboard);
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("up")
        .setLabel("🔼")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("down")
        .setLabel("🔽")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("left")
        .setLabel("◀️")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("right")
        .setLabel("▶️")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("giveUp")
        .setLabel("🔴")
        .setStyle(ButtonStyle.Danger)
    );

    const embed = await Embed(gameboard, score);
    const gameboardImage = await generateGameboardImage(gameboard);
    const message = await interaction.reply({
      components: [buttons],
      embeds: [embed],
      files: [gameboardImage],
      fetchReply: true,
    });
    const user = interaction.member.id;
    const collector = message.createMessageComponentCollector({});
    collector.on("collect", async (i) => {
      if (i.member.id == user) {
        if (i.customId == "left") {
          i.deferUpdate();
          moveLeft(gameboard);
          let won = await placeRandomNumber(gameboard);
          if (won) {
            collector.stop();
          } else {
            score = calculateScore(gameboard);
            const embed = await Embed(gameboard, score);
            const gameboardImage = await generateGameboardImage(gameboard);
            message.edit({ embeds: [embed], files: [gameboardImage] });
          }
        } else if (i.customId == "right") {
          i.deferUpdate();
          moveRight(gameboard);
          let won = await placeRandomNumber(gameboard);
          if (won) {
            collector.stop();
          } else {
            score = calculateScore(gameboard);
            const embed = await Embed(gameboard, score);
            const gameboardImage = await generateGameboardImage(gameboard);
            message.edit({ embeds: [embed], files: [gameboardImage] });
          }
        } else if (i.customId == "up") {
          i.deferUpdate();
          moveUp(gameboard);
          let won = await placeRandomNumber(gameboard);
          if (won) {
            collector.stop();
          } else {
            score = calculateScore(gameboard);
            const embed = await Embed(gameboard, score);
            const gameboardImage = await generateGameboardImage(gameboard);
            message.edit({ embeds: [embed], files: [gameboardImage] });
          }
        } else if (i.customId == "down") {
          i.deferUpdate();
          moveDown(gameboard);
          let won = await placeRandomNumber(gameboard);
          if (won) {
            collector.stop();
          } else {
            score = calculateScore(gameboard);
            const embed = await Embed(gameboard, score);
            const gameboardImage = await generateGameboardImage(gameboard);
            message.edit({ embeds: [embed], files: [gameboardImage] });
          }
        } else if (i.customId == "giveUp") {
          i.deferUpdate();
          collector.stop();
        }
      }
    });
    collector.on("end", async () => {
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("up")
          .setLabel("🔼")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("down")
          .setLabel("🔽")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("left")
          .setLabel("◀️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("right")
          .setLabel("▶️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId("giveUp")
          .setLabel("🔴")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true)
      );
      await message.edit({ components: [buttons] });
      let result = await mysql.select({
        table: "games",
        data: `WHERE id = ${user} LIMIT 1`,
      });
      console.log(result);
      if (result.length >= 1) {
        if (result[0].numberGame < score) {
          mysql.update({
            table: "games",
            column: ["numberGame"],
            data: [score],
            additionalData: `WHERE id = ${user}`,
          });
        }
      } else {
        await mysql.insert({
          table: "games",
          columns: ["id", "numberGame"],
          data: [user, score],
        });
      }
    });
  },
};
