import localforage from "localforage";
import {ApiRequest, ApiResult} from "./types";
import {labelForApiRequest} from "./util";

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

/**
 * Retrieve a result from the localforage.
 * On server-side, act like nothing was found.
 */
export const getApiResultFromStorage = (request: ApiRequest): Promise<ApiResult | null> => {
    if (!process.browser) {
        return Promise.resolve(null);
    }

    return localforage.getItem<ApiResult | null>(labelForApiRequest(request));
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
