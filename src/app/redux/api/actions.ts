import {API_ERROR, API_START, API_SUCCESS, ApiActionTypes, ApiRequest} from "./types";
import {AnyAction} from "redux";
import axios from "axios";
import {ACCEPTED, INTERNAL_SERVER_ERROR, UNAUTHORIZED} from "http-status-codes";
import {RootState} from "../store";
import {ThunkDispatch} from "redux-thunk";
import redirect from "../../../redirect";
import {IncomingMessage, ServerResponse} from "http";
import {Page} from "../../../server/interfaces/page";
import {apiResultSelector} from "./selectors";

/**
 * Action sent when an API fetch starts
 */
export const apiStart = (request: ApiRequest, isNextPage: boolean): ApiActionTypes => {
    return {
        type: API_START,
        payload: {
            request,
            isNextPage: isNextPage
        }
    }
};

/**
 * Action sent when an API fetch end with error
 */
export const apiError = (request: ApiRequest, errorCode: number, when: Date, isNextPage: boolean): ApiActionTypes => {
    return {
        type: API_ERROR,
        payload: {
            request,
            errorCode,
            when,
            isNextPage: isNextPage
        }
    }
};

/**
 * Action sent when an API fetch end with success
 */
export const apiSuccess = (request: ApiRequest, data: any, when: Date, isNextPage: boolean): ApiActionTypes => {
    return {
        type: API_SUCCESS,
        payload: {
            request,
            data,
            when,
            isNextPage: isNextPage
        }
    }
};

/**
 * Fetch the corresponding local API endpoint based on the desired item type and source.
 * Returns a Thunk.
 *
 * @param apiRequest Request object containing the endpoint, the method and optionally some data to send
 * @param apiKey The user token
 * @param isNextPage Optional param that tells if the page is not the first one (and thus that the retrieved data need
 * to be append to the store).
 * @param noCache If specified, fetch the data even if it's stored in the store
 * @param req Optional request object. Used to redirect on the server side in case the WK data are not ready
 * @param res Optional response object. Used to redirect on the server side in case the WK data are not ready
 */
export const fetchApi = (apiRequest: ApiRequest,
                         apiKey: string | undefined,
                         isNextPage: boolean,
                         noCache: boolean,
                         req?: IncomingMessage,
                         res?: ServerResponse) => {
    return (dispatch: ThunkDispatch<any, any, AnyAction>, getState: () => RootState) => {
        if (!isNextPage && !noCache) {
            // Check if the request is already retrieved and only if it's the first page and cache is enable
            const results = apiResultSelector(getState(), apiRequest);
            if (results && !results.error) {
                // Data is already in store
                // The API_SUCCESS action will be (or was) triggered by a previous action
                return Promise.resolve();
            }
        }

        // Otherwise, get the data from the API
        return fetchData(dispatch, apiRequest, apiKey, isNextPage, req, res);
    }
};

/**
 * Return a promise that resolves when the request ends. This allows two usages of fetchApi() using dispatch:
 * - The caller wait for the promise to resolve (useful on server side)
 * - The caller use a selector and wait for the redux store to change (either by apiError() or apiStart())
 */
const fetchData = (dispatch: ThunkDispatch<any, any, AnyAction>,
                   apiRequest: ApiRequest,
                   accessToken: string | undefined,
                   isNextPage: boolean,
                   req?: IncomingMessage,
                   res?: ServerResponse) => {
    dispatch(apiStart(apiRequest, isNextPage));
    return new Promise((resolve, reject) => {
        // The name of axios field changes depending on the request's method
        const dataOrParams = ["GET", "DELETE"].includes(apiRequest.method.toUpperCase()) ? "params" : "data";
        const baseUrl = process.browser ? "" : "http://localhost:" + process.env.defaultPort;

        axios.request({
            baseURL: baseUrl,
            url: apiRequest.endpoint,
            method: apiRequest.method,
            headers: {
                "content-type": "application/json",
                "authorization": accessToken ? "Bearer " + accessToken : undefined
            },
            [dataOrParams]: apiRequest.data
        }).then(response => {
            // If the response code is ACCEPTED, this means the server is downloading WK subjects. Redirect the user to
            // the waiting page
            if (response.status === ACCEPTED) {
                redirect("/wait", req, res, false, true);
                resolve();
                return;
            }

            const when = response.headers["date"] ? new Date(response.headers["date"]) : new Date();

            // If it's a paginated result, also trigger a API_NEXT_PAGE action.
            // In this case, the next page url is parsed and a new fetch is performed.
            // Only the actual data is saved to the store
            if (response.data.hasNextPage !== undefined) {
                // This is a paginated result
                const paginatedResult: Page = response.data;
                if (paginatedResult.hasNextPage && paginatedResult.nextPageUrl) {
                    dispatch(apiSuccess(apiRequest, paginatedResult.data, when, isNextPage));

                    const newRequest: ApiRequest = {
                        endpoint: paginatedResult.nextPageUrl,
                        method: apiRequest.method
                    };
                    dispatch(fetchApi(newRequest, accessToken, true, false));

                    // Resolve after each page
                    resolve();
                    return;
                }
                dispatch(apiSuccess(apiRequest, paginatedResult.data, when, isNextPage));
            } else {
                dispatch(apiSuccess(apiRequest, response.data, when, isNextPage));
            }
            resolve();

        }).catch(error => {
            const errorCode = error.response && error.response.status ? error.response.status : INTERNAL_SERVER_ERROR;

            // If the authentication failed, redirect the user
            if (errorCode == UNAUTHORIZED) {
                redirect("/login", req, res, false, true);
                reject();
                return;
            }

            console.error("API error");
            console.error(error);

            const when = error.response.headers["date"] ? new Date(error.response.headers["date"]) : new Date();
            dispatch(apiError(apiRequest, errorCode, when, isNextPage));
            reject();
        });
    });
};
