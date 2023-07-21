const sqlite3 = require("sqlite3").verbose();
const { ulid } = require("ulid");

const jobdb = new sqlite3.Database("queueing-server-job-db.sqlite3", (err) => {
  if (err) {
    console.error("データベースに接続できませんでした。", err.message);
    return;
  }

  // jobsテーブルを作成するクエリ
  const createTableQuery = `
      CREATE TABLE jobs (
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
    } else {
      console.log("jobsテーブルが作成されました。");
    }
  });
});

const getUnfinishedRecords = () => {
  // outjsonが空のレコードを抽出するクエリ
  const selectUnfinishedQuery = `
      SELECT * FROM jobs WHERE ended = '';
    `;

  // データの抽出とリストの作成
  jobdb.all(selectUnfinishedQuery, (err, rows) => {
    if (err) {
      console.error("データの抽出に失敗しました。", err.message);
      return [];
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
      return UnfinishedList;
    }
  });
};

const getRecordById = (jobid) => {
  const selectByIdQuery = `
      SELECT * FROM jobs WHERE jobid = ?;
    `;
  const values = [jobid];
  jobdb.get(selectByIdQuery, values, (err, row) => {
    if (err) {
      console.error("データの抽出に失敗しました。", err.message);
      return null;
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
        return record;
      } else {
        return null;
      }
    }
  });
};

const getRecordsByUser = (user) => {
  const selectByUserQuery = `
      SELECT * FROM jobs WHERE user = ?;
    `;
  const values = [user];
  jobdb.all(selectByUserQuery, values, (err, rows) => {
    if (err) {
      console.error("データの抽出に失敗しました。", err.message);
      return [];
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
      return records;
    }
  });
};

const registerRecord = (json) => {
  const jobid = ulid();
  const injson = json;
  const submitted = new Date();
  const insertQuery = `
      INSERT INTO jobs (jobid, injson, submitted) VALUES (?, ?, ?);
    `;
  const values = [jobid, injson, submitted];
  jobdb.run(insertQuery, values, (err, row) => {
    if (err) {
      console.error("データの登録に失敗しました。", err.message);
      return null;
    } else {
      //      const registeredRecord = getRecordById(jobid);
      //      return registeredRecord;
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
        return record;
      } else {
        return null;
      }
    }
  });
};

const startRecord = (jobid, executor) => {
  const started = new Date();
  const updateQuery = `
      UPDATE jobs SET executor = ?, started = ? WHERE jobid = ?;
    `;
  const values = [executor, started, jobid];
  jobdb.run(updateQuery, values, (err, row) => {
    if (err) {
      console.error("データの更新に失敗しました。", err.message);
      return null;
    } else {
      //    const updatedRecord = getRecordById(jobid);
      //      return updatedRecord;
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
        return record;
      } else {
        return null;
      }
    }
  });
};

const endRecord = (jobid, outjson) => {
  const ended = new Date();
  const updateQuery = `
      UPDATE jobs SET outjson = ?, ended = ? WHERE jobid = ?;
    `;
  const values = [outjson, ended, jobid];
  jobdb.run(updateQuery, values, (err, row) => {
    if (err) {
      console.error("データの更新に失敗しました。", err.message);
      return null;
    } else {
      //    const updatedRecord = getRecordById(jobid);
      //      return updatedRecord;
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
        return record;
      } else {
        return null;
      }
    }
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
  getUnfinishedRecords,
  getRecordById,
  getRecordsByUser,
  registerRecord,
  startRecord,
  endRecord,
};
