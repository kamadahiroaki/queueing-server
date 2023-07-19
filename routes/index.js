const express = require("express");
const multer = require("multer");
const jobUpload = multer({ dest: "public/jobUploads/" });
const resultUpload = multer({ dest: "public/resultUploads/" });
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const router = express.Router();
const { load, search, register, update, start } = require("./manipulatedb");

router.use(express.static("public"));

const jobqueue = [];

load(jobqueue).then((result) => {
  console.log("jobqueue:", jobqueue);
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/queue", (req, res, next) => {
  res.send(jobqueue);
});

router.get("/jobResult", (req, res, next) => {
  const job = jobqueue.find((job) => job.jobid === req.query.jobid);
  res.send(job);
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

  register(JSON.stringify(params))
    .then((jobid) => {
      const newjob = {
        jobid: jobid,
        injson: JSON.stringify(params),
        started: null,
        executor: null,
        outjson: null,
      };
      jobqueue.push(newjob);
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        fs.renameSync(file.path, "public/jobUploads/" + jobid + "_" + i);
      }
      search(jobid).then((result) => {
        res.send(result);
      });
    })
    .catch((err) => {
      console.log("err:", err);
    });
});

router.post("/jobPull", (req, res, next) => {
  //  console.log("jobPull:", req.body);
  //  console.log("jobqueue:", jobqueue);
  const timeOut = 20000; //milli second
  const now = new Date();
  index = jobqueue.findIndex(
    (job) =>
      job.outjson === null &&
      job.executor != null &&
      now.valueOf() - job.started.valueOf() > timeOut
  );
  if (index < 0) {
    index = jobqueue.findIndex((job) => job.executor == null);
  }
  let result = { message: "", job: null };
  if (index >= 0) {
    jobqueue[index].executor = req.body.executor;
    start(jobqueue[index].jobid, req.body.executor);
    search(jobqueue[index].jobid).then((job) => {
      jobqueue[index].started = new Date(job.started);
    });
    result.message = "job found";
    result.job = jobqueue[index];
    //    console.log("result:", result.job);
    res.send(result);
  } else {
    result.message = "no remaining job";
    //    console.log("result:", result);
    res.send(result);
  }
  //  res.send(result);
});

router.post("/jobFinished", resultUpload.single("file"), (req, res, next) => {
  const file = req.file;
  //  console.log("file:", file);
  fs.renameSync(file.path, "public/resultUploads/" + file.originalname);

  result = JSON.parse(req.body.job);
  console.log("resultFinished:", result);

  index = jobqueue.findIndex((job) => job.jobid === result.jobid);
  if (index >= 0 && jobqueue[index].outjson == null) {
    jobqueue[index].outjson = result.outjson;
    update(jobqueue[index].jobid, result.outjson);
    search(jobqueue[index].jobid).then((job) => {
      jobqueue[index].ended = new Date(job.ended);
    });
    console.log("job updated");
    res.send("received result");
  } else if (index >= 0) {
    res.send("received result");
  } else {
    console.error("unknown job executed");
    res.send("error");
  }
});

router.options("/", (req, res, next) => {
  res.sendStatus(200);
});

module.exports = router;
