const { Client } = require("pg");
const fs = require("fs");

const config_file_path = "config.json";

if(!fs.existsSync(config_file_path, fs.constants.F_OK)) {
  console.log('ERROR: The config file does not exist. Please create a config file \'config.json\'.');
  process.exit(1);
}

try {
  const stats = fs.statSync(config_file_path);
  const fileMode = stats.mode & 0o777; // convert to octal

  if (fileMode === 0o600) {
    console.log('The file permission is 600');
  } else {
    console.log('ERROR: The file permission of config is not 600. Please change the file permission to 600 for security reasons..');
    return 1;
  }
} catch (err) {
  console.error(err);
}

const config = JSON.parse(fs.readFileSync(config_file_path));

const client = new Client({
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port,
});

client.connect();

const text =
  "CREATE TABLE jobs(jobid varchar(26), injson varchar, outjson varchar, submitted varchar(80), executor int, started varchar(80), ended varchar(80))";
client
  .query(text)
  .then((res) => {
    // console.log(res.rows[0]);  // for debugging
    console.log("Successfully created the queue table");
  })
  .catch((e) => console.error(e.stack))
  .finally(() => {
    client.end();
  });

