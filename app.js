const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fs = require("fs");
const app = express();
const cors = require("cors");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json({ extended: true, limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });

const server_file_path = "server.json";
if (!fs.existsSync(server_file_path, fs.constants.F_OK)) {
  console.log(
    "ERROR: server.json file not found. Please execute initializeenv.js first."
  );
  process.exit(1);
}
const serverFile = JSON.parse(fs.readFileSync(server_file_path));
const reactAppServerUrl = serverFile.reactAppServerUrl;

app.use(cors({ origin: reactAppServerUrl, credentials: true }));

const master_file_path = "master.json";
if (!fs.existsSync(master_file_path, fs.constants.F_OK)) {
  console.log(
    "ERROR: master.json file not found. Please execute initializeenv.js first."
  );
  process.exit(1);
}
const master = JSON.parse(fs.readFileSync(master_file_path));

app.use((req, res, next) => {
  const b64auth = req.headers.authorization || "";
  const authHeader = req.headers.authorization || "";
  const authString = authHeader.replace(/^Basic\s+/, "");
  const decodedAuth = Buffer.from(authString, "base64").toString("utf-8");
  const [username, password] = decodedAuth.split(":");
  if (
    req.method === "OPTIONS" ||
    (username &&
      password &&
      username === master.username &&
      password === master.password)
  ) {
    return next();
  } else {
    console.log("Invalid credentials");
    console.log("username: " + username);
  }
  res.set("WWW-Authenticate", 'Basic realm="401"');
  res.status(401).send("Authentication required.");
});

app.use("/", require("./routes"));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
