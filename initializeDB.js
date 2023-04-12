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

client.connect();

const text =
  "CREATE TABLE jobs(jobid varchar(26),injson varchar(2400),outjson varchar(2400),submitted varchar(80),executor int, started varchar(80), ended varchar(80))";
client
  .query(text)
  .then((res) => {
    console.log(res.rows[0]);
  })
  .catch((e) => console.error(e.stack))
  .finally(() => {
    client.end();
  });
