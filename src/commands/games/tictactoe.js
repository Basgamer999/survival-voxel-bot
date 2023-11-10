const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const error = require("../../modules/error.js");

let { currentPlayer, firstPlayer, secondPlayer } = "";
async function buttons(gameboard, boardDisabled) {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ttt1")
      .setLabel(gameboard[0].toString())
      .setStyle(ButtonStyle.Primary)
      .setDisabled(boardDisabled[0]),
    new ButtonBuilder()
      .setCustomId("ttt2")
      .setLabel(gameboard[1].toString())
      .setStyle(ButtonStyle.Primary)
      .setDisabled(boardDisabled[1]),
    new ButtonBuilder()
      .setCustomId("ttt3")
      .setLabel(gameboard[2].toString())
      .setStyle(ButtonStyle.Primary)
      .setDisabled(boardDisabled[2])
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ttt4")
      .setLabel(gameboard[3].toString())
      .setStyle(ButtonStyle.Primary)
      .setDisabled(boardDisabled[3]),
    new ButtonBuilder()
      .setCustomId("ttt5")
      .setLabel(gameboard[4].toString())
      .setStyle(ButtonStyle.Primary)
      .setDisabled(boardDisabled[4]),
    new ButtonBuilder()
      .setCustomId("ttt6")
      .setLabel(gameboard[5].toString())
      .setStyle(ButtonStyle.Primary)
      .setDisabled(boardDisabled[5])
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ttt7")
      .setLabel(gameboard[6].toString())
      .setStyle(ButtonStyle.Primary)
      .setDisabled(boardDisabled[6]),
    new ButtonBuilder()
      .setCustomId("ttt8")
      .setLabel(gameboard[7].toString())
      .setStyle(ButtonStyle.Primary)
      .setDisabled(boardDisabled[7]),
    new ButtonBuilder()
      .setCustomId("ttt9")
      .setLabel(gameboard[8].toString())
      .setStyle(ButtonStyle.Primary)
      .setDisabled(boardDisabled[8])
  );
  return { row1, row2, row3 };
}
async function msgGen(currentPlayer, firstPlayer, secondPlayer, won) {
  if (!won) {
    let message = `<@${firstPlayer}> plays against <@${secondPlayer}> \n<@${currentPlayer}>'s turn.`;
    return message;
  } else {
    let message = `<@${firstPlayer}> plays against <@${secondPlayer}> \n<@${won}> Has won!`;
    return message;
  }
}

function checkWin(gameboard) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // horizontal rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // vertical columns
    [0, 4, 8],
    [2, 4, 6], // diagonal lines
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (
      gameboard[a] !== "-" &&
      gameboard[a] === gameboard[b] &&
      gameboard[a] === gameboard[c]
    ) {
      if (gameboard[a] == "0") {
        return secondPlayer; // returns the player who won
      } else {
        return firstPlayer; //returns the player who won
      }
    }
  }
  if (!gameboard.includes("-")) {
    return "Nobody has won"; // Return "Nobody has won" if the gameboard is full
  }

  return false; // No winner
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tic-tac-toe")
    .setDescription("Play a game of tic-tac-toe"),
  async execute(interaction, client) {
    let gameboard = ["-", "-", "-", "-", "-", "-", "-", "-", "-"];
    let boardDisabled = [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
    let won = false;
    firstPlayer = interaction.member.id;
    const button = new ButtonBuilder()
      .setCustomId("join ttt")
      .setLabel("Join!")
      .setStyle(ButtonStyle.Success);

    const message = await interaction.reply({
      components: [new ActionRowBuilder().addComponents(button)],
      content: `<@${interaction.member.id}> plays a game of tic-tac-toe. Press join! if you wish to join.`,
    });

    const collector = message.createMessageComponentCollector({
      time: 60000,
    });
    collector.on("collect", async (i) => {
      if (i.customId == "join ttt") {
        if (i.member.id == interaction.member.id) {
          i.reply({
            content: "You can't join your own game.",
            ephemeral: true,
          });
        } else {
          secondPlayer = i.member.id;
          i.reply({
            content: `Welcome by a game of tic-tac-toe against <@${interaction.member.id}>`,
            ephemeral: true,
          });
          collector.resetTimer();
          let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
          if (Math.round(Math.random()) == 0) {
            currentPlayer = firstPlayer;
          } else {
            currentPlayer = secondPlayer;
          }
          let msg = await msgGen(currentPlayer, firstPlayer, secondPlayer);
          interaction.editReply({
            components: [row1, row2, row3],
            content: msg,
          });
        }
      } else if (i.customId == "ttt1") {
        if (i.member.id == currentPlayer) {
          if (currentPlayer == firstPlayer) {
            gameboard[0] = "X";
            currentPlayer = secondPlayer;
          } else {
            gameboard[0] = "0";
            currentPlayer = firstPlayer;
          }
          won = checkWin(gameboard);
          collector.resetTimer();
          if (!won) {
            boardDisabled[0] = true;
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
          } else {
            boardDisabled = Array(9).fill(true);
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
            collector.stop();
          }
        } else {
          i.reply({
            content: "This is not your game or its not your turn.",
            ephemeral: true,
          });
        }
      } else if (i.customId == "ttt2") {
        if (i.member.id == currentPlayer) {
          if (currentPlayer == firstPlayer) {
            gameboard[1] = "X";
            currentPlayer = secondPlayer;
          } else {
            gameboard[1] = "0";
            currentPlayer = firstPlayer;
          }
          won = checkWin(gameboard);
          collector.resetTimer();
          if (!won) {
            boardDisabled[1] = true;
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
          } else {
            boardDisabled = Array(9).fill(true);
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
            collector.stop();
          }
        } else {
          i.reply({
            content: "This is not your game or its not your turn.",
            ephemeral: true,
          });
        }
      } else if (i.customId == "ttt3") {
        if (i.member.id == currentPlayer) {
          if (currentPlayer == firstPlayer) {
            gameboard[2] = "X";
            currentPlayer = secondPlayer;
          } else {
            gameboard[2] = "0";
            currentPlayer = firstPlayer;
          }
          won = checkWin(gameboard);
          collector.resetTimer();
          if (!won) {
            boardDisabled[2] = true;
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
          } else {
            boardDisabled = Array(9).fill(true);
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
            collector.stop();
          }
        } else {
          i.reply({
            content: "This is not your game or its not your turn.",
            ephemeral: true,
          });
        }
      } else if (i.customId == "ttt4") {
        if (i.member.id == currentPlayer) {
          if (currentPlayer == firstPlayer) {
            gameboard[3] = "X";
            currentPlayer = secondPlayer;
          } else {
            gameboard[3] = "0";
            currentPlayer = firstPlayer;
          }
          won = checkWin(gameboard);
          collector.resetTimer();
          if (!won) {
            boardDisabled[3] = true;
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
          } else {
            boardDisabled = Array(9).fill(true);
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
            collector.stop();
          }
        } else {
          i.reply({
            content: "This is not your game or its not your turn.",
            ephemeral: true,
          });
        }
      } else if (i.customId == "ttt5") {
        if (i.member.id == currentPlayer) {
          if (currentPlayer == firstPlayer) {
            gameboard[4] = "X";
            currentPlayer = secondPlayer;
          } else {
            gameboard[4] = "0";
            currentPlayer = firstPlayer;
          }
          won = checkWin(gameboard);
          collector.resetTimer();
          if (!won) {
            boardDisabled[4] = true;
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
          } else {
            boardDisabled = Array(9).fill(true);
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
            collector.stop();
          }
        } else {
          i.reply({
            content: "This is not your game or its not your turn.",
            ephemeral: true,
          });
        }
      } else if (i.customId == "ttt6") {
        if (i.member.id == currentPlayer) {
          if (currentPlayer == firstPlayer) {
            gameboard[5] = "X";
            currentPlayer = secondPlayer;
          } else {
            gameboard[5] = "0";
            currentPlayer = firstPlayer;
          }
          won = checkWin(gameboard);
          collector.resetTimer();
          if (!won) {
            boardDisabled[5] = true;
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
          } else {
            boardDisabled = Array(9).fill(true);
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
            collector.stop();
          }
        } else {
          i.reply({
            content: "This is not your game or its not your turn.",
            ephemeral: true,
          });
        }
      } else if (i.customId == "ttt6") {
        if (i.member.id == currentPlayer) {
          if (currentPlayer == firstPlayer) {
            gameboard[5] = "X";
            currentPlayer = secondPlayer;
          } else {
            gameboard[5] = "0";
            currentPlayer = firstPlayer;
          }
          won = checkWin(gameboard);
          collector.resetTimer();
          if (!won) {
            boardDisabled[5] = true;
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
          } else {
            boardDisabled = Array(9).fill(true);
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
            collector.stop();
          }
        } else {
          i.reply({
            content: "This is not your game or its not your turn.",
            ephemeral: true,
          });
        }
      } else if (i.customId == "ttt7") {
        if (i.member.id == currentPlayer) {
          if (currentPlayer == firstPlayer) {
            gameboard[6] = "X";
            currentPlayer = secondPlayer;
          } else {
            gameboard[6] = "0";
            currentPlayer = firstPlayer;
          }
          won = checkWin(gameboard);
          collector.resetTimer();
          if (!won) {
            boardDisabled[6] = true;
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
          } else {
            boardDisabled = Array(9).fill(true);
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
            collector.stop();
          }
        } else {
          i.reply({
            content: "This is not your game or its not your turn.",
            ephemeral: true,
          });
        }
      } else if (i.customId == "ttt8") {
        if (i.member.id == currentPlayer) {
          if (currentPlayer == firstPlayer) {
            gameboard[7] = "X";
            currentPlayer = secondPlayer;
          } else {
            gameboard[7] = "0";
            currentPlayer = firstPlayer;
          }
          won = checkWin(gameboard);
          collector.resetTimer();
          if (!won) {
            boardDisabled[7] = true;
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
          } else {
            boardDisabled = Array(9).fill(true);
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
            collector.stop();
          }
        } else {
          i.reply({
            content: "This is not your game or its not your turn.",
            ephemeral: true,
          });
        }
      } else if (i.customId == "ttt9") {
        if (i.member.id == currentPlayer) {
          if (currentPlayer == firstPlayer) {
            gameboard[8] = "X";
            currentPlayer = secondPlayer;
          } else {
            gameboard[8] = "0";
            currentPlayer = firstPlayer;
          }
          won = checkWin(gameboard);
          collector.resetTimer();
          if (!won) {
            boardDisabled[8] = true;
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
          } else {
            boardDisabled = Array(9).fill(true);
            let { row1, row2, row3 } = await buttons(gameboard, boardDisabled);
            let msg = await msgGen(
              currentPlayer,
              firstPlayer,
              secondPlayer,
              won
            );
            i.deferUpdate();
            interaction.editReply({
              components: [row1, row2, row3],
              content: msg,
            });
            collector.stop();
          }
        } else {
          i.reply({
            content: "This is not your game or its not your turn.",
            ephemeral: true,
          });
        }
      }
    });
    collector.on("end", (collected, endReason) => {
      if (endReason == "time") {
        interaction.editReply(`This game has ended due to time out.`);
      }
    });
  },
};
