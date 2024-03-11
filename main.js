const axios = require("axios");
const fs = require("fs");
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
      // Check for extension types
      const extension = item.name.split(".").pop().toLowerCase();
      const isImage = ["png", "jpg", "jpeg", "gif", "bmp"].includes(extension);
      const isJson = extension === "json";
      const isReadMe = extension === "md";

      // Skip README files
      if (isReadMe || item.name === "package-lock.json") continue;

      // Get file
      const fileResponse = await axios.get(item.download_url);
      const fileContent = fileResponse.data;

      repoFiles.push({
        name: item.name,
        type: "file",
        content: isImage
          ? ""
          : isJson
          ? JSON.stringify(fileContent)
          : fileContent,
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

// Write the file structure and contents to a text file
function writeFileStructure(fileStructure, fileHeading, filePath, indent = "") {
  let fileContent;
  fileContent = fileHeading;

  for (const item of fileStructure) {
    if (item.type === "directory") {
      fileContent += `${indent}📁 ${item.name}\n`;
      fileContent += writeFileStructure(
        item.children,
        "",
        filePath,
        `${indent} `
      );
    } else {
      fileContent += `${indent}📄 ${item.name}\n`;
      fileContent += `${indent} Content:\n`;
      fileContent += `${indent} \`\`\`\n`;
      fileContent += `${item.content}\n`;
      fileContent += `${indent} \`\`\`\n`;
      fileContent += "\n";
    }
  }

  fs.writeFileSync(filePath, fileContent);
  return fileContent;
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
    // console.log(`Repository: ${repoData.full_name}`);
    // console.log(`Link: ${repoData.html_url}`);
    // console.log("\nFile Structure and Contents:\n");
    // printFileStructure(repoFiles);

    const fileContent = {
      repoName: `${repoData.full_name}`,
      repoLink: `${repoData.html_url}`,
      files: repoFiles,
    };
    // let fileHeading;
    // fileHeading = `Repository: ${repoData.full_name}\nLink: ${repoData.html_url}\n\nFile Structure and Contents:\n`;
    // writeFileStructure(repoFiles, fileHeading, `${REPO_NAME}.txt`);
    fs.writeFileSync(`${REPO_NAME}.json`, JSON.stringify(fileContent, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
