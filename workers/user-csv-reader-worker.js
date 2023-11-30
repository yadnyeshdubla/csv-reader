const { workerData, parentPort } = require("worker_threads");
const User = require("../models/user.model");
const csvReader = require("../services/csv-reader-service");
const sequelize = require("../config/db");
const { Op } = require("sequelize");

const csvFilePath = workerData.csvFilePath;

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database and tables synced");
    runCSVReader();
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });

async function runCSVReader() {
  try {
    if (process.env.TRUNCATE_USERS) {
      deleteAllUsers();
    }

    const batchSize = 1000; // Adjust this value

    const jsonData = await csvReader(csvFilePath);

    for (let i = 0; i < jsonData.length; i += batchSize) {
      const batch = jsonData.slice(i, i + batchSize);
      const usersToCreate = batch.map((element) => {
        const { name, age, address } = element;
        return {
          name: name.firstName + " " + name.lastName,
          age: age,
          address: address,
        };
      });
      await User.bulkCreate(usersToCreate);
    }
    await outputReport();
    parentPort.postMessage({ message: "ok" });
  } catch (error) {
    console.log(error);
    parentPort.postMessage({ message: "failed" });
  }
}

async function outputReport() {
  try {
    const lessThen20 = await User.count({
      where: {
        age: {
          [Op.lt]: 20,
        },
      },
    });

    const between20to40 = await User.count({
      where: {
        age: {
          [Op.lt]: 40,
          [Op.gt]: 19,
        },
      },
    });

    const between40to60 = await User.count({
      where: {
        age: {
          [Op.lt]: 61,
          [Op.gt]: 39,
        },
      },
    });

    const geaterThen60 = await User.count({
      where: {
        age: {
          [Op.gt]: 60,
        },
      },
    });

    const all = await User.count();

    const table = [
      {
        ["Age Group"]: "< 20",
        ["% Distribution"]:( (100 * lessThen20) / all).toFixed(2),
      },
      {
        ["Age Group"]: "20 to 40",
        ["% Distribution"]: ((100 * between20to40) / all).toFixed(2),
      },
      {
        ["Age Group"]: "40 to 60",
        ["% Distribution"]: ((100 * between40to60) / all).toFixed(2),
      },
      {
        ["Age Group"]: "> 60",
        ["% Distribution"]: ((100 * geaterThen60) / all).toFixed(2),
      },
    ];

    console.table(table);
  } catch (error) {
    console.error("Error querying users:", error);
  }
}

async function deleteAllUsers() {
  try {
    const deletedRowsCount = await User.destroy({
      where: {},
    });

    console.log('Number of deleted users:', deletedRowsCount);
  } catch (error) {
    console.error('Error deleting users:', error);
  }
}
