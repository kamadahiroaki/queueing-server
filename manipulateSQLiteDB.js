const sqlite3 = require("sqlite3").verbose();
const { ulid } = require("ulid");

const loadDatabase = () => {
  return new Promise((resolve, reject) => {
    const jobdb = new sqlite3.Database(
      "queueing-server-job-db.sqlite3",
      (err) => {
        if (err) {
          console.error("データベースに接続できませんでした。", err.message);
          reject(err);
          // return;
        }

        // jobsテーブルを作成するクエリ
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS jobs (
        jobid TEXT PRIMARY KEY,
        user TEXT,
        injson TEXT,
        outjson TEXT,
        submitted TEXT,
        executor TEXT,
        started TEXT,
        ended TEXT
      );
    `;

        // テーブル作成の実行
        jobdb.run(createTableQuery, (err) => {
          if (err) {
            console.error("テーブルの作成に失敗しました。", err.message);
            reject(err);
          } else {
            console.log("jobsテーブルが作成されました。");
            resolve(jobdb);
          }
        });
      }
    );
  });
};

const getAllRecords = () => {
  const selectAllQuery = `
      SELECT * FROM jobs;
    `;
  return new Promise((resolve, reject) => {
    jobdb.all(selectAllQuery, (err, rows) => {
      if (err) {
        console.error("データの抽出に失敗しました。", err.message);
        reject(err);
      } else {
        const List = rows.map((row) => ({
          jobid: row.jobid,
          user: row.user,
          injson: row.injson,
          outjson: row.outjson,
          submitted: row.submitted,
          executor: row.executor,
          started: row.started,
          ended: row.ended,
        }));
        resolve(List);
      }
    });
  });
};

const getUnfinishedRecords = () => {
  const selectUnfinishedQuery = `
      SELECT * FROM jobs WHERE ended IS NULL OR ended = '';
    `;
  return new Promise((resolve, reject) => {
    jobdb.all(selectUnfinishedQuery, (err, rows) => {
      if (err) {
        console.error("データの抽出に失敗しました。", err.message);
        reject(err);
      } else {
        const UnfinishedList = rows.map((row) => ({
          jobid: row.jobid,
          user: row.user,
          injson: row.injson,
          outjson: row.outjson,
          submitted: row.submitted,
          executor: row.executor,
          started: row.started,
          ended: row.ended,
        }));
        resolve(UnfinishedList);
      }
    });
  });
};

const getRecordById = (jobid) => {
  const selectByIdQuery = `
      SELECT * FROM jobs WHERE jobid = ?;
    `;
  const values = [jobid];
  return new Promise((resolve, reject) => {
    jobdb.get(selectByIdQuery, values, (err, row) => {
      if (err) {
        console.error("データの抽出に失敗しました。", err.message);
        reject(err);
      } else {
        if (row) {
          const record = {
            jobid: row.jobid,
            user: row.user,
            injson: row.injson,
            outjson: row.outjson,
            submitted: row.submitted,
            executor: row.executor,
            started: row.started,
            ended: row.ended,
          };
          resolve(record);
        } else {
          resolve(null);
        }
      }
    });
  });
};

const getRecordsByUser = (user) => {
  const selectByUserQuery = `
      SELECT * FROM jobs WHERE user = ?;
    `;
  const values = [user];
  return new Promise((resolve, reject) => {
    jobdb.all(selectByUserQuery, values, (err, rows) => {
      if (err) {
        console.error("データの抽出に失敗しました。", err.message);
        reject(err);
      } else {
        const records = rows.map((row) => ({
          jobid: row.jobid,
          user: row.user,
          injson: row.injson,
          outjson: row.outjson,
          submitted: row.submitted,
          executor: row.executor,
          started: row.started,
          ended: row.ended,
        }));
        resolve(records);
      }
    });
  });
};

const registerRecord = (json, user) => {
  const jobid = ulid();
  const injson = json;
  const submitted = new Date().toISOString();
  const insertQuery = `
      INSERT INTO jobs (jobid, user, injson, submitted) VALUES (?, ?, ?,?);
    `;
  const values = [jobid, user, injson, submitted];
  return new Promise((resolve, reject) => {
    jobdb.run(insertQuery, values, (err, row) => {
      if (err) {
        console.error("データの登録に失敗しました。", err.message);
        reject(err);
      } else {
        getRecordById(jobid)
          .then((registeredRecord) => {
            resolve(registeredRecord);
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      }
    });
  });
};

const startRecord = (jobid, executor) => {
  const started = new Date().toISOString();
  const updateQuery = `
      UPDATE jobs SET executor = ?, started = ? WHERE jobid = ?;
    `;
  const values = [executor, started, jobid];
  return new Promise((resolve, reject) => {
    jobdb.run(updateQuery, values, (err, row) => {
      if (err) {
        console.error("データの更新に失敗しました。", err.message);
        reject(err);
      } else {
        getRecordById(jobid)
          .then((updatedRecord) => {
            resolve(updatedRecord);
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      }
    });
  });
};

const endRecord = (jobid, outjson) => {
  const ended = new Date().toISOString();
  const updateQuery = `
      UPDATE jobs SET outjson = ?, ended = ? WHERE jobid = ?;
    `;
  const values = [outjson, ended, jobid];
  return new Promise((resolve, reject) => {
    jobdb.run(updateQuery, values, (err, row) => {
      if (err) {
        console.error("データの更新に失敗しました。", err.message);
        reject(err);
      } else {
        getRecordById(jobid)
          .then((updatedRecord) => {
            resolve(updatedRecord);
          })
          .catch((err) => {
            console.error(err);
            reject(err);
          });
      }
    });
  });
};

// jobdb.close((err) => {
//   if (err) {
//     console.error(
//       "データベース接続を閉じる際にエラーが発生しました。",
//       err.message
//     );
//   } else {
//     console.log("データベース接続が正常に閉じられました。");
//   }
// });

module.exports = {
  loadDatabase,
  getAllRecords,
  getUnfinishedRecords,
  getRecordById,
  getRecordsByUser,
  registerRecord,
  startRecord,
  endRecord,
};
