import {ServerResponse} from "http";
import {PERMANENT_REDIRECT, TEMPORARY_REDIRECT} from "http-status-codes";

/**
 * Redirect to the specified url
 */
export default (url: string, response?: ServerResponse, permanent?: boolean) => {
    if (!process.browser && response) {
        response.writeHead(permanent ? PERMANENT_REDIRECT : TEMPORARY_REDIRECT, {
            Location: url
        });
        response.end();
    }
}
