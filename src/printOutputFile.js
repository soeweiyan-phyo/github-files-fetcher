// Print the file structure and contents
function printRepoFiles(repoFiles, indent = "") {
  for (const item of repoFiles) {
    if (item.type === "directory") {
      console.log(`${indent}📁 ${item.name}`);
      printRepoFiles(item.children, `${indent}  `);
    } else {
      console.log(`${indent}📄 ${item.name}`);
      console.log(`${indent}  Content:`);
      console.log(`${indent}  \`\`\``);
      console.log(`${item.content}`);
      console.log(`${indent}  \`\`\``);
      console.log();
    }
  }
}

function printOutputFile(outputData) {
  //Print the repository information and file structure
  console.log(`Repository: ${outputData.repoName}`);
  console.log(`Link: ${outputData.repoLink}`);
  console.log("\nFile Structure and Contents:\n");
  printRepoFiles(outputData.files);
}

module.exports = printOutputFile;
