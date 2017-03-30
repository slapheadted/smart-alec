import * as GitHubApi from "github";
const Buffer = require("buffer").Buffer;
const github = new GitHubApi();
const fixture = require("./fixture.json");

async function getFileContents(path, version = "master") {
  const content = await github.repos.getContent({
    owner: "slapheadted",
    repo: "review-bot",
    path: path,
    ref: version
  });
  return new Buffer(content.data.content, 'base64').toString("utf8");
}

export async function handler(event, context) {
  // comment the following assignment when not local dev
  event = {
    Records: [{
      Sns: {
        Message: JSON.stringify(fixture)
      }
    }]
  }

  const githubEvent = JSON.parse(event.Records[0].Sns.Message);

  const beforeCommitHash = githubEvent.before;
  const afterCommitHash = githubEvent.after;

  github.authenticate({
    type: 'token',
    token: 'secret'
  });

  const previous = await getFileContents("README.md", beforeCommitHash);
  const current = await getFileContents("README.md", afterCommitHash);

  github.issues.createComment({
    // user: githubEvent.repository.owner.login,
    owner: "slapheadted",
    // user: "slapheadted",
    // repo: githubEvent.repository.name,
    repo: "review-bot",
    // number: githubEvent.issue.number,
    number: 7,
    body: `The previous version had ${previous.length} characters dude. The new version has ${current.length} characters.`
  }, context.done);

};