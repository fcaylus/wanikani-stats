import WaniKaniApi from "./WaniKaniApi";
import {User} from "../data/interfaces/user";

/**
 * Hash map of successfully connected users.
 * For each token, the corresponding date is login time.
 */
let users: { [token: string]: Date } = {};

/**
 * Duration (in ms) when the token is valid.
 */
export const LOGIN_TIMEOUT = 24 * 60 * 60 * 1000; // 24h

/**
 * Checks if a user is connected.
 * This is used as a basic authentication system since some endpoints doesn't require an actual connection to WaniKani.
 * So for every request, if the token is in the database "users" and not expired, the request can proceed.
 * Otherwise, try to connect to WK to see if the token is still valid
 * @param token
 */
export const isConnected = (token: string) => {
    if (users[token]) {
        const connectionDate = users[token];
        if (Date.now() - connectionDate.getTime() > LOGIN_TIMEOUT) {
            delete users[token];
            return false;
        }
        return true;
    }
    return false;
};

/**
 * Login only if the user is not already connected.
 * @param token
 */
export const loginIfNecessary = async (token: string): Promise<boolean> => {
    if (isConnected(token)) {
        return true;
    }

    return login(token);
};

/**
 * Force a new login
 * To actually login, connect to a WaniKani API endpoint and see if there are errors.
 * @param token
 */
export const login = async (token: string): Promise<boolean> => {
    // Try to login
    const wkResult = await WaniKaniApi(token).get("user");
    if (!wkResult || wkResult.error) {
        if (users[token]) {
            delete users[token];
        }
        return false;
    }

    console.log("New user logged in: " + wkResult.data.data.username);

    users[token] = new Date();
    return true;
};

/**
 * Logout the user
 */
export const logout = (token: string) => {
    if (users[token]) {
        delete users[token];
    }
};

/**
 * Return the maximum level allowed for the user
 */
export const maxLevelAllowed = async (token: string): Promise<number> => {
    const wkResult = await WaniKaniApi(token).get("user");
    if (wkResult && !wkResult.error) {
        const user = wkResult.data.data;
        return user.subscription.max_level_granted;
    }
    return 0;
};

/**
 * Return the user object for the specified token
 */
export const getUser = async (token: string): Promise<User | undefined> => {
    // See: https://docs.api.wanikani.com/#user for endpoint documentation
    const wkResult = await WaniKaniApi(token).get("user");

    if (wkResult.error || !wkResult.data || !wkResult.data.data) {
        return undefined
    }

    const data = wkResult.data.data;

    return {
        token: token,
        username: data.username,
        maxLevel: data.subscription.max_level_granted,
        currentLevel: data.level,
        profileUrl: data.profile_url,
        startDate: new Date(data.started_at)
    };
};

