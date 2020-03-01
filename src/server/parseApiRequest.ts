import {NextApiRequest} from "next";
import {ACCEPTED, METHOD_NOT_ALLOWED, OK, UNAUTHORIZED} from "http-status-codes";
import isUUID from "../isUUID";
import {downloadAllSubjects, needToDownloadWKSubjects} from "../data/dl/dl";
import {loginIfNecessary} from "./users";
import {parse as cookieParse} from "cookie";
import {API_KEY_COOKIE_NAME} from "../app/apiKey";

export interface RequestParsedResult {
    error: boolean;
    errorCode: number;
    apiKey: string;
}

/**
 * Parse an API request and check for the method and the API key.
 * Also verify if the user is logged in and if the WaniKani data are already downloaded.
 */
export default async (req: NextApiRequest, method: string, skipWKCheck?: boolean): Promise<RequestParsedResult> => {
    if (!req.method || req.method.toUpperCase() !== method.toUpperCase()) {
        return Promise.resolve({error: true, errorCode: METHOD_NOT_ALLOWED, apiKey: ""});
    }

    let apiKey = "";

    // Search in header first ...
    if (req.headers["authorization"]) {
        apiKey = req.headers["authorization"].toString().replace("Bearer ", "").trim();
    }
    // ... and then in params
    else if (req.query && req.query.apiKey && typeof req.query.apiKey === "string") {
        apiKey = req.query.apiKey;
    }
    // ... and then in the "Cookie" header
    else if (req.headers["cookie"]) {
        const cookies = cookieParse(req.headers["cookie"]);
        if (cookies[API_KEY_COOKIE_NAME]) {
            apiKey = cookies[API_KEY_COOKIE_NAME];
        } else {
            return Promise.resolve({error: true, errorCode: UNAUTHORIZED, apiKey: ""});
        }
    } else {
        return Promise.resolve({error: true, errorCode: UNAUTHORIZED, apiKey: ""});
    }

    if (!isUUID(apiKey)) {
        return Promise.resolve({error: true, errorCode: UNAUTHORIZED, apiKey: ""});
    }

    // Login
    if (!(await loginIfNecessary(apiKey))) {
        return Promise.resolve({error: true, errorCode: UNAUTHORIZED, apiKey: ""});
    }

    // Download WK subjects if needed. This is called at every request since the data is required for most of the request
    // Actually, only the first request of the first user will download something since it's stored to filesystem
    if (needToDownloadWKSubjects()) {
        downloadAllSubjects(apiKey);
        if (!skipWKCheck) {
            return Promise.resolve({error: true, errorCode: ACCEPTED, apiKey: ""});
        }
    }

    return Promise.resolve({error: false, errorCode: OK, apiKey: apiKey});
}
