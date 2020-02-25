import axios, {AxiosRequestConfig} from "axios";
import {INTERNAL_SERVER_ERROR} from "http-status-codes";
import {setupCache} from "axios-cache-adapter";

export interface ApiResult {
    error: boolean;
    errorCode: number;
    data?: any;
}

const cacheStore = setupCache({
    // 1h
    maxAge: 60 * 60 * 1000,
    clearOnStale: false,
    clearOnError: true,
    readOnError: true
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
        instance: () => {
            return axiosInstance;
        },
        get: async (endpoint: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResult> => {
            const result: Promise<ApiResult> = axiosInstance.get(endpoint, {
                params: params,
                headers: {"Authorization": "Bearer " + apiKey},
                ...config
            }).then((res) => {
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
            return result;
        }
    };
    return api;
}
