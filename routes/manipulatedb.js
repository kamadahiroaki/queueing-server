const { Client } = require("pg");
const { ulid } = require("ulid");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("config.json"));

const newClient = () => {
  return new Client({
    //    user: "postgres",
    //    host: "localhost",
    //    database: "mytestdb",
    //    password: "postgres",
    //    port: 5432,
    user: config.password,
    host: config.host,
    database: config.database,
    password: config.password,
    port: config.port,
  });
};

const load = (jobqueue) => {
  const client = newClient();
  client.connect();
  const text = "SELECT * FROM jobs ORDER BY submitted ASC";
  return client
    .query(text)
    .then((res) => {
      client.end();
      res.rows.forEach((row) => {
        jobqueue.push(row);
      });
      return res.rows;
    })
    .catch((e) => {
      console.error(e.stack);
      client.end();
    });
};

const search = (jobid) => {
  const client = newClient();
  client.connect();
  const text = "SELECT * FROM jobs WHERE jobid=$1";
  const values = [jobid];
  return client
    .query(text, values)
    .then((res) => {
      client.end();
      return res.rows[0];
    })
    .catch((e) => {
      console.error(e.stack);
      client.end();
    });
};

const register = (json) => {
  const client = newClient();
  client.connect();

  const text =
    "INSERT INTO jobs(jobid,injson,submitted) VALUES($1,$2,$3) RETURNING *";
  const jobid = ulid();
  const injson = json;
  const submitted = new Date();
  const values = [jobid, injson, submitted];

  return client
    .query(text, values)
    .then((res) => {
      console.log(res.rows[0]);
      client.end();
      //      return res.rows[0];
      return jobid;
    })
    .catch((e) => {
      console.error(e.stack);
      client.end();
    });
};

const update = (jobid, outjson) => {
  const client = newClient();
  client.connect();

  const ended = new Date();
  const text = "UPDATE jobs SET outjson=$2,ended=$3 WHERE jobid=$1";
  values = [jobid, outjson, ended];
  return client
    .query(text, values)
    .then((res) => {
      console.log(res.rows[0]);
      client.end();
      return res.rows[0];
    })
    .catch((e) => {
      console.error(e.stack);
      client.end();
    });
};

const start = (jobid) => {
  const client = newClient();
  client.connect();

  const started = new Date();
  const text = "UPDATE jobs SET started=$2 WHERE jobid=$1";
  values = [jobid, started];
  return client
    .query(text, values)
    .then((res) => {
      console.log(res.rows[0]);
      client.end();
      return res.rows[0];
    })
    .catch((e) => {
      console.error(e.stack);
      client.end();
    });
};

module.exports = { load, search, register, update, start };
