const axios = require("axios");
const dotenv = require("dotenv");

const getRepoFiles = require("./src/getRepoFiles");
const writeOutputFile = require("./src/writeOutputFile");

dotenv.config();

const REPO_NAME = "11-worldwise";

// GitHub API endpoints
const API_BASE_URL = "https://api.github.com";
const REPO_ENDPOINT = `${API_BASE_URL}/repos/${process.env.GITHUB_USERNAME}/${REPO_NAME}`;

// Authentication headers
const headers = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
};

async function main() {
  try {
    // Retrieve repository information
    const repoResponse = await axios.get(REPO_ENDPOINT, { headers });
    const repoData = repoResponse.data;

    // Get the file structures and contents
    const repoFiles = await getRepoFiles();

    const outputData = {
      repoName: `${repoData.full_name}`,
      repoLink: `${repoData.html_url}`,
      files: repoFiles,
    };

    writeOutputFile(outputData);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
