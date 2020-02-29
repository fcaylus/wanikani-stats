import Cookies from "js-cookie";
import {IncomingMessage} from "http";
import {parse as cookieParse} from "cookie";

export const API_KEY_COOKIE_NAME = "wanikani-api-key";

/**
 * Try to get the API key from the local cookie if on browser, and from the request object if on server
 */
export const getApiKey = (request?: IncomingMessage): string | undefined => {
    if (process.browser) {
        // Parse the browser cookie set when logged in
        const cookie = Cookies.get(API_KEY_COOKIE_NAME);
        if (cookie) {
            return cookie;
        }
    } else if (request) {
        // For server-side, we check inside the incoming request headers
        if (request.headers["cookie"]) {
            const cookies = cookieParse(request.headers["cookie"]);
            if (cookies[API_KEY_COOKIE_NAME]) {
                return cookies[API_KEY_COOKIE_NAME];
            }
        }
    }
    return undefined;
};

export const hasApiKey = (request?: IncomingMessage): boolean => {
    return getApiKey(request) !== undefined;
};

/**
 * Save the specified token with a cookie
 */
export const saveApiKey = (token: string) => {
    Cookies.remove(API_KEY_COOKIE_NAME, {expires: 14});
    Cookies.set(API_KEY_COOKIE_NAME, token, {expires: 14}); // 14 days duration
};

export const removeApiKey = () => {
    Cookies.remove(API_KEY_COOKIE_NAME, {expires: 14});
};
