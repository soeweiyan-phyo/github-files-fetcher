const fs = require("fs");

function writeOutputFile(outputData) {
  const repoName = outputData.repoName.split("/").pop();
  fs.writeFileSync(`${repoName}.json`, JSON.stringify(outputData, null, 2));
}

module.exports = writeOutputFile;
