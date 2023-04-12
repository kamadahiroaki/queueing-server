const { Client } = require("pg");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("config.json"));

const client = new Client({
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port,
});

client.connect();

const text = "DROP TABLE jobs";

client
  .query(text)
  .then((res) => {
    console.log(res.rows[0]);
  })
  .catch((e) => console.error(e.stack))
  .finally(() => {
    client.end();
  });
