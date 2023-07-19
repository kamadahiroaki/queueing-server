const generatePassword = require("generate-password");
const fs = require("fs");

// パスワードの設定
const passwordOptions = {
  length: 32, // パスワードの長さ
  numbers: true, // 数字を含む
  //  symbols: true, // 特殊文字を含む
  symbols: false,
  uppercase: true, // 英字大文字を含む
  lowercase: true, // 英字小文字を含む
};

// パスワードの生成
const password = generatePassword.generate(passwordOptions);

const master = { username: "master", password: password };

fs.writeFile("master.json", JSON.stringify(master), (err) => {
  if (err) {
    console.log("cannot write master.json" + err);
    return;
  }
  console.log("master.json is created");
});
fs.chmodSync("master.json", 0o600);

// const envData =
//   "REACT_APP_SERVER_URL=http://localhost:5000" +
//   "\n" +
//   "QUEUEING_SERVER_URL=http://localhost:8080" +
//   "\n" +
//   "MASTER_USERNAME=" +
//   master.username +
//   "\n" +
//   "MASTER_PASSWORD=" +
//   master.password +
//   "\n";
// fs.writeFileSync(".env", envData, (err) => {
//   if (err) {
//     console.log("cannot write .env" + err);
//     return;
//   }
//   console.log(".env is created");
// });

try {
  fs.chmodSync("master.json", 0o600);
} catch (err) {
  console.log("cannot change the permission of master.json" + err);
}

// try {
//   fs.chmodSync(".env", 0o600);
// } catch (err) {
//   console.log("cannot change the permission of .env" + err);
// }
