## dl

Files in this directory allow to download subjects data (radicals, kanjis, vocabularies) from WaniKani API.
The download the data at runtime to avoid copyright issues, ie. we can't simply dump WaniKani database in a public repository ...

The files are downloaded once and then saved to a temporary directory.

Since we need an API key to download the data, the download occurs at the first connection of the first user.
