const { Client } = require("pg");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("config.json"));

const client = new Client({
  user: config.password,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port,
});

const table = "jobs";

try {
  client.connect();

  setInterval(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // calculate 1 week ago

    const query = `DELETE FROM ${table} WHERE submitted < $1`;
    const values = [oneWeekAgo];

    client
      .query(query, values)
      .then((result) => {
        console.log(`${result.rowCount} record(s) deleted`);
      })
      .catch((error) => {
        console.error(error);
      });
  }, 24 * 60 * 60 * 1000); // run once a day
} catch (error) {
  console.error(error);
}
