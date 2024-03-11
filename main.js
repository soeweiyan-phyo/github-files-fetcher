const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const REPO_NAME = "11-worldwise";

// GitHub API endpoints
const API_BASE_URL = "https://api.github.com";
const REPO_ENDPOINT = `${API_BASE_URL}/repos/${process.env.GITHUB_USERNAME}/${REPO_NAME}`;
const CONTENTS_ENDPOINT = `${REPO_ENDPOINT}/contents`;

// Authentication headers
const headers = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
};

// Retrieve file structures and contents
async function getRepoFiles(path = "") {
  const contentsUrl = `${CONTENTS_ENDPOINT}/${path}`;
  const contentsResponse = await axios.get(contentsUrl, { headers });
  const contentsData = contentsResponse.data;

  const repoFiles = [];

  for (const item of contentsData) {
    if (item.type === "dir") {
      repoFiles.push({
        name: item.name,
        type: "directory",
        children: await getRepoFiles(item.path),
      });
    } else {
      const fileResponse = await axios.get(item.download_url);
      const fileContent = fileResponse.data;
      repoFiles.push({
        name: item.name,
        type: "file",
        content: fileContent,
      });
    }
  }

  return repoFiles;
}

// Print the file structure and contents
function printFileStructure(fileStructure, indent = "") {
  for (const item of fileStructure) {
    if (item.type === "directory") {
      console.log(`${indent}📁 ${item.name}`);
      printFileStructure(item.children, `${indent}  `);
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

async function main() {
  try {
    // Retrieve repository information
    const repoResponse = await axios.get(REPO_ENDPOINT, { headers });
    const repoData = repoResponse.data;
    // console.log(repoData);

    // Get the file structures and contents
    const repoFiles = await getRepoFiles();

    // Print the repository information and file structure
    console.log(`Repository: ${repoData.full_name}`);
    console.log(`Link: ${repoData.html_url}`);
    console.log("\nFile Structure and Contents:\n");
    printFileStructure(repoFiles);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
