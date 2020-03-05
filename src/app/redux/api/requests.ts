import {ApiRequest} from "./types";
import {IncomingMessage, ServerResponse} from "http";
import {fetchApi} from "./actions";
import {getApiKey} from "../../apiKey";
import {hashMapObjectMerger, listMerger} from "./mergers";

const API_BASE_URL = "/api/";

/**
 * This file contains boilerplate functions for each API endpoint. Each have:
 * - XXXRequest() function: create the Redux request object used to identify the results
 * - fetchXXX() function: wrapper around fetchApi() action
 */

/*
 * /api/user/status
 */

export const statusRequest = (): ApiRequest => {
    return {
        endpoint: API_BASE_URL + "user/status",
        method: "GET"
    };
};

export const fetchStatus = (req?: IncomingMessage, res?: ServerResponse) => {
    return fetchApi(statusRequest(), getApiKey(req), true, false, undefined, req, res);
};

/*
 * /api/progress/levels
 */

export const levelsRequest = (): ApiRequest => {
    return {
        endpoint: API_BASE_URL + "progress/levels",
        method: "GET"
    };
};

export const fetchLevels = (req?: IncomingMessage, res?: ServerResponse) => {
    return fetchApi(levelsRequest(), getApiKey(req), true, true, hashMapObjectMerger, req, res);
};

/*
 * /api/ready
 * NOTE: cache is disabled for this endpoint
 */

export const readyRequest = (): ApiRequest => {
    return {
        endpoint: API_BASE_URL + "ready",
        method: "GET"
    };
};

export const fetchReady = (req?: IncomingMessage, res?: ServerResponse) => {
    return fetchApi(readyRequest(), getApiKey(req), false, false, undefined, req, res);
};

/*
 * /api/login
 * NOTE: cache is disabled for this endpoint
 */

export const loginRequest = (): ApiRequest => {
    return {
        endpoint: API_BASE_URL + "login",
        method: "GET"
    };
};

export const fetchLogin = (apiKey: string, req?: IncomingMessage, res?: ServerResponse) => {
    return fetchApi(loginRequest(), apiKey, false, false, undefined, req, res);
};

/*
 * /api/logout
 * NOTE: cache is disabled for this endpoint
 */

export const logoutRequest = (): ApiRequest => {
    return {
        endpoint: API_BASE_URL + "logout",
        method: "GET"
    };
};

export const fetchLogout = (req?: IncomingMessage, res?: ServerResponse) => {
    return fetchApi(logoutRequest(), getApiKey(req), false, false, undefined, req, res);
};

/*
 * /api/user
 */

export const userRequest = (): ApiRequest => {
    return {
        endpoint: API_BASE_URL + "user",
        method: "GET"
    };
};

export const fetchUser = (req?: IncomingMessage, res?: ServerResponse) => {
    return fetchApi(userRequest(), getApiKey(req), true, false, undefined, req, res);
};

/*
 * /api/items/[item_type]/[source]
 */

export const itemsRequest = (itemType: string, source: string): ApiRequest => {
    return {
        endpoint: API_BASE_URL + "items/" + itemType + "/" + source,
        method: "GET"
    };
};

export const fetchItems = (itemType: string, source: string, req?: IncomingMessage, res?: ServerResponse) => {
    return fetchApi(itemsRequest(itemType, source), getApiKey(req), true, false, undefined, req, res);
};

/*
 * /api/stats/[item_type]/[source]
 */

export const statsRequest = (itemType: string, source: string): ApiRequest => {
    return {
        endpoint: API_BASE_URL + "stats/" + itemType + "/" + source,
        method: "GET"
    };
};

export const fetchStats = (itemType: string, source: string, req?: IncomingMessage, res?: ServerResponse) => {
    return fetchApi(statsRequest(itemType, source), getApiKey(req), true, false, undefined, req, res);
};

/*
 * /api/progress
 */

export const progressRequest = (itemType: string): ApiRequest => {
    return {
        endpoint: API_BASE_URL + "progress",
        method: "GET",
        data: {
            type: itemType
        }
    };
};

export const fetchProgress = (itemType: string, req?: IncomingMessage, res?: ServerResponse) => {
    return fetchApi(progressRequest(itemType), getApiKey(req), true, true, hashMapObjectMerger, req, res);
};

/*
 * /api/reviews/stats
 */

export const reviewsStatsRequest = (): ApiRequest => {
    return {
        endpoint: API_BASE_URL + "reviews/stats",
        method: "GET"
    };
};

export const fetchReviewsStats = (req?: IncomingMessage, res?: ServerResponse) => {
    return fetchApi(reviewsStatsRequest(), getApiKey(req), true, true, listMerger, req, res);
};
