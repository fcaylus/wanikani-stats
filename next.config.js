const nextBuildId = require('next-build-id');

module.exports = {
    poweredByHeader: true,
    env: {
        appName: "WaniKani Stats Reloaded",
        description: process.env.npm_package_description,
        author: process.env.npm_package_author_name,
        authorLink: process.env.npm_package_author_url,
        githubLink: process.env.npm_package_homepage,
        defaultPort: "3170",
        commitVersion: nextBuildId.sync({dir: __dirname}),
        version: process.env.npm_package_version
    }
};
