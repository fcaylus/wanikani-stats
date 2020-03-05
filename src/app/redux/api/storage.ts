import localforage from "localforage";
import {ApiRequest, ApiResult} from "./types";
import {labelForApiRequest} from "./util";
import semver from "semver/preload";

const STORAGE_VERSION_KEY = "wk-stats-reloaded-version";

// On server, do not call this
if (process.browser) {
    localforage.config({
        name: "api",
        driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
        storeName: "api_store",
        description: "API request results",
        version: 1
    });
}

const checkStorageVersion = (): Promise<string | null> => {
    return localforage.getItem<string | null>(STORAGE_VERSION_KEY);
};

/**
 * Checks if the current data in storage is compatible with the current version of the app (by comparing the
 * major numbers, since they reflects breaking changes). If not, clear everything.
 * This allows to have breaking changes. If the version is lower than 1.0.0, compare the GIT commit instead.
 */
const sanitizeStorage = (): Promise<void> => {
    return new Promise<void>(resolve => {
        checkStorageVersion().then(version => {
            // For versions lower than 1.0.0, check the commits value. Otherwise, compare version
            const currentVersion = semver.lt(process.env.version ? process.env.version : "0.0.0", "1.0.0") ? process.env.commitVersion : process.env.version;
            const isOlderOrInvalid = !process.env.version
                || !version
                || (semver.lt(process.env.version, "1.0.0")
                    ? version != process.env.commitVersion
                    : (!semver.valid(version) || semver.major(version) < semver.major(process.env.version)));

            if (isOlderOrInvalid) {
                // Current version is invalid, remove everything
                console.warn("Invalid data in storage. Clear everything !");
                localforage.clear().finally(() => {
                    // Create the correct version value
                    localforage.setItem(STORAGE_VERSION_KEY, currentVersion).finally(() => resolve());
                });
            } else {
                // This is the same version, everything is ok
                resolve();
            }
        })
    })
};

/**
 * Retrieve a result from the localforage.
 * On server-side, act like nothing was found.
 */
export const getApiResultFromStorage = (request: ApiRequest): Promise<ApiResult | null> => {
    if (!process.browser) {
        return Promise.resolve(null);
    }

    return sanitizeStorage().then(() => {
        return localforage.getItem<ApiResult | null>(labelForApiRequest(request));
    });
};

/**
 * Remove a result from the localforage.
 * On server-side, act like the remove was successful.
 */
export const removeApiResultFromStorage = (request: ApiRequest): Promise<void> => {
    if (!process.browser) {
        return Promise.resolve();
    }

    return localforage.removeItem(labelForApiRequest(request));
};

/**
 * Save a result to the localforage.
 * On server-side, act like the saving operation was successful.
 */
export const saveApiResultToStorage = (request: ApiRequest, result: ApiResult): Promise<ApiResult | null> => {
    if (!process.browser) {
        return Promise.resolve(result);
    }

    return localforage.setItem<ApiResult | null>(labelForApiRequest(request), result);
};
