const { SlashCommandSubcommandGroupBuilder } = require("discord.js");
const mysql = require("mysql");
const pool = mysql.createPool({
  host: process.env.DBhost,
  user: process.env.DBuser,
  password: process.env.DBpass,
  database: process.env.Database,
});
const log = require("./log");

let connection;

function handleDisconnect() {
  connection = pool.getConnection(function (err, conn) {
    if (err) {
      log.error("Error getting database connection:", err.stack);
      setTimeout(handleDisconnect, 60000);
    } else {
      log.info("Database connection established");
      conn.on("error", function (err) {
        log.error("Database error:", err.stack);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
          handleDisconnect();
        } else {
          throw err;
        }
      });
      // Release connection back to the pool after use
      conn.release();
    }
  });
}

function startConnection() {
  handleDisconnect();
}
startConnection();
//functie for insert
async function insert({ table, columns, data }) {
  const columnList = columns.join(", ");
  const values = data.map((value) => mysql.escape(value)).join(", ");
  const query = `INSERT INTO ${table} (${columnList}) VALUES (${values})`;
  console.log(query);
  const start = new Date();
  pool.query(query, (error, results) => {
    const end = new Date();
    if (error) {
      log.error(error);
    } else {
      log.debug(
        `Een INSERT query is correct uitgevoerd en duurde ${
          end - start
        }ms. Query: "${query}".`
      );
    }
  });
}

// Functie om een SELECT-query uit te voeren
async function select({ table, data }) {
  if (data == undefined) {
    data = "";
  }
  const query = `SELECT * FROM ${table} ${data}`;
  const start = new Date();
  return new Promise((resolve, reject) => {
    pool.query(query, (error, results) => {
      const end = new Date();
      if (error) {
        log.error(error);
      } else {
        log.debug(
          `Een SELECT query is correct uitgevoerd en duurde ${
            end - start
          }ms. Query: "${query}".`
        );
        resolve(results);
      }
    });
  });
}

// Functie om een UPDATE-query uit te voeren
function update({ table, column, data, additionalData }) {
  const setClauses = column
    .map((col, index) => `${col} = ${mysql.escape(data[index])}`)
    .join(", ");
  const query = `UPDATE ${table} SET ${setClauses} ${additionalData}`;
  const start = new Date();
  pool.query(query, (error, results) => {
    const end = new Date();
    if (error) {
      log.error(error + "query:" + query);
    } else {
      log.debug(
        `Een UPDATE query is correct uitgevoerd en duurde ${
          end - start
        }ms. Query: "${query}".`
      );
    }
  });
}

async function custom(query) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    pool.query(query, (error, results) => {
      const end = new Date();
      if (error) {
        log.error(error);
      } else {
        log.debug(
          `Een CUSTOM query is correct uitgevoerd en duurde ${
            end - start
          }ms. Query: "${query}".`
        );
        resolve(results);
      }
    });
  });
}

module.exports = {
  insert,
  select,
  update,
  custom,
};
