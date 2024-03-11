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

// Retrieve file structures and contents from the GitHub repository
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

      // Skip README and package-lock files (personal preference)
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

module.exports = getRepoFiles;
