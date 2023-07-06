const generatePassword = require("generate-password");
const fs = require("fs");

// パスワードの設定
const passwordOptions = {
  length: 16, // パスワードの長さ
  numbers: true, // 数字を含む
  symbols: true, // 特殊文字を含む
  uppercase: true, // 英字大文字を含む
  lowercase: true, // 英字小文字を含む
};

// パスワードの生成
const executorPassword = generatePassword.generate(passwordOptions);
const testClientPassword = generatePassword.generate(passwordOptions);

const client = { username: "testclient", password: testClientPassword };
const executor = { username: "executor", password: executorPassword };
const master = { client, executor };

fs.writeFile("executor.json", JSON.stringify(executor), (err) => {
  if (err) {
    console.log("cannot write executor.json" + err);
    return;
  }
  console.log("executor.json is created");
});

fs.writeFile("master.json", JSON.stringify(master), (err) => {
  if (err) {
    console.log("cannot write master.json" + err);
    return;
  }
  console.log("master.json is created");
});
fs.chmodSync("master.json", 0o600);

const envData =
  "REACT_APP_SERVER_URL=http://localhost:8080" +
  "\n" +
  "REACT_APP_TEST_CLIENT_USERNAME=" +
  client.username +
  "\n" +
  "REACT_APP_TEST_CLIENT_PASSWORD=" +
  client.password +
  "\n";
fs.writeFileSync(".env", envData, (err) => {
  if (err) {
    console.log("cannot write .env" + err);
    return;
  }
  console.log(".env is created");
});
fs.chmodSync("master.json", 0o600);

try {
  fs.chmodSync("executor.json", 0o600);
} catch (err) {
  console.log("cannot change the permission of executor.json" + err);
}
try {
  fs.chmodSync("master.json", 0o600);
} catch (err) {
  console.log("cannot change the permission of master.json" + err);
}
try {
  fs.chmodSync(".env", 0o600);
} catch (err) {
  console.log("cannot change the permission of .env" + err);
}
