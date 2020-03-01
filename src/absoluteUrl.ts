import {IncomingMessage} from "http"

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
