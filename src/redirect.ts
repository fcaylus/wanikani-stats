import {IncomingMessage, ServerResponse} from "http";
import {PERMANENT_REDIRECT, TEMPORARY_REDIRECT} from "http-status-codes";
import absoluteUrl from "./absoluteUrl";

export const DEFAULT_REDIRECT_URL = "/items/kanji/wanikani";

/**
 * Redirect to the specified url
 */
export default (url: string, request?: IncomingMessage, response?: ServerResponse, permanent?: boolean, addRedirect?: boolean) => {
    let destUrl;
    try {
        destUrl = new URL(url);
    } catch (e) {
        destUrl = new URL(absoluteUrl(request) + url);
    }

    if (!process.browser && response && request) {
        // server side
        const currentUrl = absoluteUrl(request) + request.url;
        destUrl.searchParams.set("redirect", encodeURI(currentUrl));

        response.writeHead(permanent ? PERMANENT_REDIRECT : TEMPORARY_REDIRECT, {
            Location: addRedirect ? destUrl.toString() : url
        });
        response.end();
    } else if (process.browser) {
        // browser side
        destUrl.searchParams.set("redirect", encodeURI(window.location.href));
        window.location.href = addRedirect ? destUrl.toString() : url;
    }
}
