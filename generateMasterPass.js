const generatePassword = require("generate-password");
const fs = require("fs");

// パスワードの設定
const passwordOptions = {
  length: 64, // パスワードの長さ
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

  try {
    fs.chmodSync("master.json", 0o600);
    console.log("master.json is created");
  } catch (err) {
    console.log("cannot change the permission of master.json" + err);
  }
});
