const nextBuildId = require("next-build-id");
const withPWA = require("next-pwa");

module.exports = withPWA({
    poweredByHeader: false,
    pwa: {
        dest: "public"
    },
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
});
