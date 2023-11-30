const { Worker } = require("worker_threads");
require("dotenv").config();

const run = () => {
  const workerData = { csvFilePath: process.env.CSV_FILE_PATH };

  const worker = new Worker("./workers/user-csv-reader-worker.js", {
    workerData,
  });
  worker.on("message", (res) => {
    console.log("Received result from worker:", res);
    worker.terminate();
  });
  worker.on("error", (error) => {
    console.error("Error in worker:", error);
  });
  worker.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Worker exited with code ${code}`);
    }
  });
};


module.exports = {
    run
};
