# WaniKani Stats Reloaded

[![Version](https://img.shields.io/github/package-json/v/fcaylus/wanikani-stats?style=for-the-badge)](https://github.com/fcaylus/wanikani-stats)
[![Build Status](https://img.shields.io/travis/fcaylus/wanikani-stats?style=for-the-badge)](https://travis-ci.org/fcaylus/wanikani-stats)
[![License](https://img.shields.io/github/license/fcaylus/wanikani-stats?style=for-the-badge)](https://github.com/fcaylus/wanikani-stats/blob/master/LICENSE)

A React/Next.js/Typescript based statistics web app for the amazing [WaniKani](https://wanikani.com) website !

Hosted here if you want to try: [wkstats.tranqyll.fr](https://wkstats.tranqyll.fr).

NOTE: It is still a Work In Progress.

![App demo](https://github.com/fcaylus/wanikani-stats/raw/master/public/showcase.gif)

## About

There are actually two main statistics website for WaniKani: [wkstats.com](https://wkstats.com) and [wkstats.com:10001](https://wkstats.com:10001).
I wanted to create a new app with more modern technology, [WaniKani API V2](https://docs.api.wanikani.com/) and share its source code so everyone can contribute.

It uses the following technologies:

- **React/Typescript**
- **Material UI:** UI library for React
- **Next.js:** For local API server and SSR rendering
- **Docker:** Easily deploy it to my own server
- **TravisCI:** Continuous Integration

## How it works

The web app doesn't communicate with the WaniKani API directly. Instead, it sends its requests to the local API server
(under ```/pages/api```) which will then connect to WaniKani. This allows mainly two things:
- Cache requests made to WaniKani
- Post-process WaniKani responses in a suitable format for the frontend

To authenticate the user, the local API need the user's access token. To check if the token is valid, a simple request
to WaniKani is made and the response code is checked. The token is then stored in a browser's cookie.

Items data (radicals, kanjis, vocabularies) from the different sources are stored in ```src/data/dump```. This directory
also contains scripts to dump them before launching the app. However, due to copyright issues, the WaniKani data can't be
dumped in a public repo like this, so they are retrieved at runtime, using scripts under ```src/data/dl```. They
are only retrieved once, during the first connection of the first user since the last reboot (since we need an API token
to download them) and then saved to a temporary folder.

## Project structure

- ```pages/```: Pages of the web app
- ```pages/api```: API endpoints
- ```public/```: Static images and files served by the server
- ```src/```: The rest of the source code

## Contribution

If you want to contribute to the project, feel free to create an issue or to propose a pull request.
I'll be more than happy !

## Roadmap

See the issues page !

## Icon
Favicon generated using [favicon.io](https://favicon.io).
Credits: https://www.flaticon.com/authors/freepik

## License

This code is licensed under the MIT License. See LICENSE file for more information.
