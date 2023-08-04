const express = require("express");
const multer = require("multer");
const jobUpload = multer({ dest: "public/jobUploads/" });
const resultUpload = multer({ dest: "public/resultUploads/" });
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const router = express.Router();
//const { load, search, register, update, start } = require("./manipulatedb");
const {
  getAllRecords,
  getUnfinishedRecords,
  getRecordById,
  getRecordsByUser,
  registerRecord,
  startRecord,
  endRecord,
} = require("../manipulateSQLiteDB");
const { type } = require("os");
const { get } = require("http");

router.use(express.static("public"));

const unfinishedJobs = [];
const loadUnfinishedJobs = async () => {
  const records = await getUnfinishedRecords();
  for (const record of records) {
    unfinishedJobs.push(record);
  }
  //  console.log("unfinishedJobs:", unfinishedJobs);
};
loadUnfinishedJobs();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/unfinishedJobs", (req, res, next) => {
  res.send(unfinishedJobs);
});

router.get("/usersJobs", (req, res, next) => {
  getRecordsByUser(req.headers["user"])
    .then((records) => {
      res.send(records);
    })
    .catch((err) => {
      console.error(err);
      res.send({ message: "error" });
    });
});

router.get("/allJobs", (req, res, next) => {
  getAllRecords()
    .then((records) => {
      res.send(records);
    })
    .catch((err) => {
      console.error(err);
      res.send({ message: "error" });
    });
});

// router.get("/queue", (req, res, next) => {
//   res.send(jobqueue);
// });

router.get("/jobResult", (req, res, next) => {
  getRecordById(req.query.jobid)
    .then((job) => {
      res.send(job);
    })
    .catch((err) => {
      console.error(err);
      res.send({ message: "error" });
    });
});

router.get("/resultFile", (req, res, next) => {
  const fileName = req.query.jobid + ".html";
  console.log("fileName:", fileName);
  res.sendFile(fileName, { root: "public/resultUploads" });
});

router.get("/jobFile", (req, res, next) => {
  const fileName = req.query.fileName;
  console.log("fileName:", fileName);
  res.sendFile(fileName, { root: "public/jobUploads" });
});

router.post("/jobSubmit", jobUpload.array("files"), (req, res, next) => {
  const params = JSON.parse(req.body.params);
  params.infiles = 0;
  if (req.files.length > 0) {
    params.infiles = req.files.length;
  }
  registerRecord(JSON.stringify(params), req.headers["user"]).then((record) => {
    console.log("req.headers['user']:", req.headers["user"]);
    console.log("record:", record);
    console.log(typeof record);
    if (record == null) {
      res.send({ message: "could not register job" });
    } else {
      unfinishedJobs.push(record);
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        fs.renameSync(file.path, "public/jobUploads/" + record.jobid + "_" + i);
      }
      res.send(record);
    }
  });
});

router.post("/jobPull", (req, res, next) => {
  //  console.log("jobPull:", req.body);
  //  console.log("jobqueue:", jobqueue);
  const timeOut = 20000; //milli second
  const now = new Date();

  let index = unfinishedJobs.findIndex(
    (job) =>
      job.executor != null && now.valueOf() - job.started.valueOf() > timeOut
  );
  if (index < 0) {
    index = unfinishedJobs.findIndex((job) => job.executor == null);
  }
  if (index < 0) {
    console.log(unfinishedJobs);
    res.send({ message: "no remaining job", job: null });
  } else {
    startRecord(unfinishedJobs[index].jobid, req.body.executor)
      .then((record) => {
        if (record == null) {
          res.send({ message: "could not start job", job: null });
        } else {
          unfinishedJobs[index].executor = req.body.executor;
          unfinishedJobs[index].started = record.started;
          res.send({ message: "", job: record });
        }
      })
      .catch((err) => {
        console.log("err:", err);
        res.send({ message: "could not start job", job: null });
      });
  }
});

router.post("/jobFinished", resultUpload.single("file"), (req, res, next) => {
  const file = req.file;
  //  console.log("file:", file);
  fs.renameSync(file.path, "public/resultUploads/" + file.originalname);

  result = JSON.parse(req.body.job);
  //  console.log("resultFinished:", result);

  endRecord(result.jobid, JSON.stringify(result.outjson))
    .then((record) => {
      if (record == null) {
        res.send({ message: "job " + result.jobid + " is not registered" });
      } else {
        const index = unfinishedJobs.findIndex(
          (job) => job.jobid === record.jobid
        );
        if (index < 0) {
          console.error("job " + record.jobid + " is not in unfinishedJobs");
        } else if (unfinishedJobs[index].ended != null) {
          console.error("job " + record.jobid + " is already finished");
        } else {
          unfinishedJobs.splice(index, 1);
        }

        res.send({ message: "received result" });
      }
    })
    .catch((err) => {
      console.log("err:", err);
      res.send({ message: "job " + result.jobid + " is not registered" });
    });
});

router.options("/", (req, res, next) => {
  res.sendStatus(200);
});

module.exports = router;
