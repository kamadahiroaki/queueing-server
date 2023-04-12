const { search, register, update } = require("./manipulatedb");

const blastSearch = (jobid, injson) => {
  const ended = new Date();
  const outjson = "test:result";
  update(jobid, outjson, ended);
  return search(jobid);
};
module.exports = blastSearch;
