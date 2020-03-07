import axios, {AxiosRequestConfig} from "axios";
import {INTERNAL_SERVER_ERROR, OK} from "http-status-codes";
import {setupCache} from "axios-cache-adapter";
import {IncomingMessage} from "http";
import absoluteUrl from "../absoluteUrl";
import {Page} from "./interfaces/page";
import {QueryParameter} from "./interfaces/query";
import moment from "moment";

/**
 * Timeout used for "static" endpoints like /items and /stats.
 * When an updated_after field is specified for these endpoints, the duration is computed and if the resource
 * timed out, a completely new result is returned. Otherwise, nothing is returned.
 */
export const STATIC_API_TIMEOUT = 3 * 24 * 60 * 60 * 1000; // 3 days

/**
 * Checks the time difference between "now" and the updated_after parameter
 */
export const isResourceTimedOut = (updatedAfter?: QueryParameter) => {
    return !updatedAfter || moment().diff(moment(updatedAfter.toString())) > STATIC_API_TIMEOUT;
};

export interface ApiResult {
    error: boolean;
    errorCode: number;
    data?: any;
}

const cacheStore = setupCache({
    // 3h
    maxAge: 3 * 60 * 60 * 1000,
    clearOnStale: false,
    clearOnError: true,
    readOnError: true,
    exclude: {
        query: false
    },
    key: (req) => {
        return req.url + JSON.stringify(req.params) + req.headers["Authorization"];
    }
});

const axiosInstance = axios.create({
    baseURL: "https://api.wanikani.com/v2/",
    adapter: cacheStore.adapter
});

/**
 * A wrapper function around WaniKani API V2, using axios.
 * See https://docs.api.wanikani.com/ for the documentation.
 *
 * Every request is cached in memory on the server-side to limit the number of requests to WaniKani servers.
 */
export default (apiKey: string) => {
    const api = {
        /**
         * GET request
         * @param endpoint The endpoint to get
         * @param params Params of the GET request
         * @param config Additional params for axios
         */
        get: async (endpoint: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResult> => {
            return axiosInstance.get(endpoint, {
                params: params,
                headers: {"Authorization": "Bearer " + apiKey},
                ...config
            }).then((res) => {
                if (res.request.fromCache) {
                    console.log("Served from cache: " + res.config.url);
                } else {
                    console.log("Served from internet: " + res.config.url);
                }

                return {
                    error: false,
                    errorCode: res.status,
                    data: res.data
                }
            }).catch((error) => {
                /*
                 * Handle the different types of errors
                 */
                if (error.response) {
                    console.error(error.response.headers);
                    return {
                        error: true,
                        errorCode: error.response.status,
                        data: error.response.data
                    }
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of http.ClientRequest
                    console.error(error.request);
                    return {
                        error: true,
                        errorCode: INTERNAL_SERVER_ERROR
                    }
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.error(error.message);
                    return {
                        error: true,
                        errorCode: INTERNAL_SERVER_ERROR,
                        data: error.message
                    }
                }
            });
        },
        /**
         * Fetch the specified endpoint with a GET request and parse it as a paginate response from WaniKani. The data
         * field of the result is a Page.
         * @param endpoint The endpoint to get. It has to return a paginate response
         * @param params Params of the request
         * @param pageAfterId If specified, allows to retrieve a specified page. Otherwise, the first page is fetched
         * @param req Request object of the user's connection to the API. Used to find the current url.
         * @param config Optional axios config
         */
        getPaginated: async (endpoint: string, params?: any, pageAfterId?: string, req?: IncomingMessage, config?: AxiosRequestConfig): Promise<ApiResult> => {
            // Get the data
            const result = await api.get(endpoint, {
                ...params,
                page_after_id: pageAfterId
            }, config);

            if (result.error || !result.data) {
                return result;
            }

            // Find the next page url (if it exists) and add "page_after_id" query to the current url
            let hasNextPage = !!result.data.pages.next_url;
            let nextPageUrl = undefined;
            let nextPageAfterId = undefined;
            if (hasNextPage) {
                // Find the page_after_id param
                nextPageAfterId = (new URL(result.data.pages.next_url)).searchParams.get("page_after_id");
                nextPageAfterId = nextPageAfterId == null ? undefined : nextPageAfterId;

                if (!nextPageAfterId) {
                    hasNextPage = false;
                } else if (req && req.url) {
                    // Append the page_after_id param to the current url
                    nextPageUrl = new URL(absoluteUrl(req) + req.url);
                    nextPageUrl.searchParams.set("page_after_id", nextPageAfterId);
                    nextPageUrl = nextPageUrl.href;
                }
            }

            const page: Page = {
                nextPageUrl: nextPageUrl,
                hasNextPage: hasNextPage,
                numberOfPages: Math.ceil(result.data.total_count / result.data.pages.per_page),
                data: result.data.data,
            };

            return {
                error: false,
                errorCode: OK,
                data: page
            };
        }
    };
    return api;
}
