const csvtojson = require('csvtojson');

async function csvReaderService(csvFilePath) {
  const jsonArray = await csvtojson().fromFile(csvFilePath);
  return jsonArray;
}

module.exports = csvReaderService;