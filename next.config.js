const nextBuildId = require("next-build-id");

module.exports = {
    poweredByHeader: false,
    env: {
        appName: "WaniKani Stats Reloaded",
        keywords: "wanikani, statistics, kanji, jlpt, stats",
        subject: "wanikani statistics",
        description: process.env.npm_package_description,
        author: process.env.npm_package_author_name,
        authorLink: process.env.npm_package_author_url,
        githubLink: process.env.npm_package_homepage,
        defaultPort: "3170",
        commitVersion: nextBuildId.sync({dir: __dirname}),
        version: process.env.npm_package_version
    }
};
