const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fs = require("fs");
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json({ extended: true, limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const allowCrossDomain = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization,access-token"
  );
  next();
};
app.use(allowCrossDomain);

const master_file_path = "master.json";
if (!fs.existsSync(master_file_path, fs.constants.F_OK)) {
  console.log(
    "ERROR: master.json file not found. Please execute initializeenv.js first."
  );
  process.exit(1);
}
const master = JSON.parse(fs.readFileSync(master_file_path));
const clientAuth = master.client;
const executorAuth = master.executor;
//const auth = { username: "admin", password: "admin" };
app.use((req, res, next) => {
  const b64auth = req.headers.authorization || "";
  const [username, password] = Buffer.from(
    b64auth.split(" ")[1] || "",
    "base64"
  )
    .toString()
    .split(":");
  if (
    req.method === "OPTIONS" ||
    (username &&
      password &&
      ((username === executorAuth.username &&
        password === executorAuth.password) ||
        (username === clientAuth.username && password === clientAuth.password)))
  ) {
    return next();
  } else {
    console.log("Invalid credentials");
    console.log("username: " + username);
    console.log("password: " + password);
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
