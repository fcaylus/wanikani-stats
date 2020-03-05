import {IncomingMessage} from "http"

/**
 * Compute the current absolute url. On server-side, use the Next request object to guess it.
 * Taken and modified from: https://github.com/jekrb/next-absolute-url
 */
const absoluteUrl = (req?: IncomingMessage, localhostAddress?: string) => {
    if (!localhostAddress) {
        localhostAddress = "localhost:" + process.env.defaultPort;
    }

    let host = (req ? req.headers.host : window.location.host) || localhostAddress;
    let protocol = /^localhost(:\d+)?$/.test(host) ? "http:" : "https:";

    if (req && req.headers["x-forwarded-host"] && typeof req.headers["x-forwarded-host"] === "string") {
        host = req.headers["x-forwarded-host"];
    }

    if (req && req.headers["x-forwarded-proto"] && typeof req.headers["x-forwarded-proto"] === "string") {
        protocol = `${req.headers["x-forwarded-proto"]}:`;
    }

    return protocol + "//" + host;
};

export default absoluteUrl
