import {API_ERROR, API_START, API_SUCCESS, ApiActionTypes, ApiRequest, ApiResult} from "./types";
import {AnyAction} from "redux";
import axios from "axios";
import {ACCEPTED, INTERNAL_SERVER_ERROR, UNAUTHORIZED} from "http-status-codes";
import {RootState} from "../reducer";
import {ThunkDispatch} from "redux-thunk";
import redirect from "../../../redirect";
import {IncomingMessage, ServerResponse} from "http";
import {isPage, Page} from "../../../server/interfaces/page";
import {apiResultSelector} from "./selectors";
import {getApiResultFromStorage, removeApiResultFromStorage, saveApiResultToStorage} from "./storage";
import {mergePaginatedResultWithStore} from "./util";
import {Merger} from "./mergers";

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
export const apiSuccess = (request: ApiRequest, result: ApiResult, isNextPage: boolean): ApiActionTypes => {
    return {
        type: API_SUCCESS,
        payload: {
            request,
            data: result.data,
            when: result.when ? result.when : new Date(),
            isNextPage: isNextPage
        }
    }
};

/**
 * Fetch the specified local API endpoint.
 * Returns a Thunk.
 *
 * @param apiRequest Request object containing the endpoint, the method and optionally some data to send
 * @param apiKey The user token
 * @param cacheInStore Say if the result should be READ from the store or not. If true, cacheInStorage should also be true
 * @param cacheInStorage Say if the result should be READ and SAVE to the storage.
 * @param mergeFunction Merge function used to merge the result with the previous one in storage. This is only used if
 * cacheInStorage is true. This allows the use of "updated_after" query. If it's null or undefined (and cacheInStorage is true),
 * no merge is done and the storage is read (no "updated_after" request is send) which is not recommended.
 * @param req Optional request object. Used to redirect on the server side in case the WK data are not ready
 * @param res Optional response object. Used to redirect on the server side in case the WK data are not ready
 */
export const fetchApi = (apiRequest: ApiRequest,
                         apiKey: string | undefined,
                         cacheInStore: boolean,
                         cacheInStorage: boolean,
                         mergeFunction?: Merger,
                         req?: IncomingMessage,
                         res?: ServerResponse) => {
    return fetchApiImpl(apiRequest, apiKey, false, cacheInStore, cacheInStorage, undefined, mergeFunction, req, res);
};

/**
 * Same as fetchApi but with more params required for recursive calls. This function just checks is the data are already
 * stored (in redux store or in a localforage), and then calls fetchData() to actually send the request.
 * - isNextPage param tells if the page is not the first one in case of a previous paginated result
 * (and thus the retrieved data need to be append to the store).
 * - updatedAfter and mergeFunction: use to retrieve only newer data. If both of them are non-null, merging is required
 */
const fetchApiImpl = (apiRequest: ApiRequest,
                      apiKey: string | undefined,
                      isNextPage: boolean,
                      cacheInStore: boolean,
                      cacheInStorage: boolean,
                      updatedAfter?: Date,
                      mergeFunction?: Merger,
                      req?: IncomingMessage,
                      res?: ServerResponse) => {
    return (dispatch: ThunkDispatch<any, any, AnyAction>, getState: () => RootState) => {
        // Check if the request is cached in the store
        if (!isNextPage && cacheInStore) {
            const results = apiResultSelector(getState(), apiRequest);
            if (results && !results.error) {
                // Data is already in store
                // The API_SUCCESS action will be (or was) triggered by a previous action
                return Promise.resolve();
            }
        }

        // Check if the request is in the storage
        if (!isNextPage && cacheInStorage) {
            return new Promise((resolve, reject) => {
                getApiResultFromStorage(apiRequest).then((storedValue) => {
                    if (storedValue) {
                        // The value is stored in storage
                        // If a merge function is defined, only retrieved "newer" data using "updated_after" parameter.
                        // Otherwise, this means this endpoints doesn't support merging, so the data can be retrieved directly.
                        if (storedValue.when) {
                            if (mergeFunction) {
                                fetchData(dispatch, getState, apiRequest, apiKey, false, cacheInStore, cacheInStorage, storedValue.when, mergeFunction, req, res)
                                    .then(() => resolve()).catch(() => reject());
                            } else {
                                dispatch(apiSuccess(apiRequest, storedValue, false));
                                resolve();
                            }
                            return;
                        } else {
                            // The value is stored but without a "when" parameter. This shouldn't happen and means the data
                            // is malformed. So, remove it.
                            removeApiResultFromStorage(apiRequest);
                        }
                    }

                    // Here, either the value is not stored, either it was malformed. So we need to fetch the complete data
                    fetchData(dispatch, getState, apiRequest, apiKey, isNextPage, cacheInStore, cacheInStorage, undefined, undefined, req, res)
                        .then(() => resolve()).catch(() => reject());
                }).catch((error) => {
                    // On localforage error, simply try to download the data
                    console.error("Could not access to localforage to retrieve a previous request");
                    console.error(error);
                    fetchData(dispatch, getState, apiRequest, apiKey, isNextPage, cacheInStore, cacheInStorage, undefined, undefined, req, res)
                        .then(() => resolve()).catch(() => reject());
                })
            })
        }

        // Request was neither in store, neither in the storage, or cache was disable or this is the next page of a paginated result.
        return fetchData(dispatch, getState, apiRequest, apiKey, isNextPage, cacheInStore, cacheInStorage, updatedAfter, mergeFunction, req, res);
    }
};

/**
 * Return a promise that resolves when the request ends. This allows two usages of fetchApi() using dispatch:
 * - The caller wait for the promise to resolve (useful on server side)
 * - The caller use a selector and wait for the redux store to change (either by apiError() or apiStart())
 */
const fetchData = (dispatch: ThunkDispatch<any, any, AnyAction>,
                   getState: () => RootState,
                   apiRequest: ApiRequest,
                   accessToken: string | undefined,
                   isNextPage: boolean,
                   cacheInStore: boolean,
                   cacheInStorage: boolean,
                   updatedAfter?: Date,
                   mergeFunction?: Merger,
                   req?: IncomingMessage,
                   res?: ServerResponse) => {
    dispatch(apiStart(apiRequest, isNextPage));
    return new Promise((resolve, reject) => {
        // The name of axios field changes depending on the request's method
        const dataOrParams = ["GET", "DELETE"].includes(apiRequest.method.toUpperCase()) ? "params" : "data";
        const baseUrl = process.browser ? "" : "http://localhost:" + process.env.defaultPort;

        /*
         * Create the data/params object
         */
        let axiosData = {
            updated_after: updatedAfter
        };
        // On next page request, the query are already in the url
        if (!isNextPage || dataOrParams == "data") {
            axiosData = {...axiosData, ...apiRequest.data};
        }

        /*
         * Send the actual request
         */
        axios.request({
            baseURL: baseUrl,
            url: apiRequest.endpoint,
            method: apiRequest.method,
            headers: {
                "content-type": "application/json",
                "authorization": accessToken ? "Bearer " + accessToken : undefined
            },
            [dataOrParams]: axiosData
        }).then(async (response) => {
            // If the response code is ACCEPTED, this means the server is downloading WK subjects. Redirect the user to
            // the waiting page
            if (response.status === ACCEPTED) {
                redirect("/wait", req, res, false, true);
                resolve();
                return;
            }

            let result: ApiResult = {
                error: false,
                fetching: false,
                when: response.headers["date"] ? new Date(response.headers["date"]) : new Date(),
                data: isPage(response.data) ? response.data.data : response.data
            };

            // If merging is required, read the previous value from the storage and then merge it with the new one.
            // If isNextPage is true, it means it is a recursive call and the data had already been merged with the
            // storage. In that case, only merge with the store, and not the storage.
            if (!isNextPage && mergeFunction && updatedAfter) {
                const previousResult = await getApiResultFromStorage(apiRequest);
                if (previousResult) {
                    result = mergeFunction(previousResult, result);
                }
            }

            dispatch(apiSuccess(apiRequest, result, isNextPage));

            // Check if it's a paginated result.
            // In this case, the next page url is parsed and a new fetchApi() is performed.
            // Only the actual data is saved to the store, not the whole page
            if (isPage(response.data)) {
                // This is a paginated result
                const paginatedResult: Page = response.data;

                if (paginatedResult.hasNextPage && paginatedResult.nextPageUrl) {
                    const newRequest: ApiRequest = {
                        endpoint: paginatedResult.nextPageUrl,
                        method: apiRequest.method,
                        // Keep the data object. It will not be actually sent to the API (it should be already in the url)
                        // but it is used to generate the exact same label for the next page (and merge the results)
                        data: apiRequest.data
                    };
                    dispatch(fetchApiImpl(newRequest, accessToken, true, cacheInStore, cacheInStorage, updatedAfter, mergeFunction));
                } else {
                    // Results of paginated responses are only stored to localforage only when there is no new page
                    // Before saving the result to the storage, merge them with the current store since it's a paginated result
                    // (don't merge if it's the first page)
                    if (cacheInStorage) {
                        new Promise(resolve1 => {
                            const mergedResult = isNextPage
                                ? mergePaginatedResultWithStore(apiResultSelector(getState(), apiRequest), result.data, result.when)
                                : result;
                            saveApiResultToStorage(apiRequest, mergedResult).then(() => resolve1());
                        });
                    }
                }
            } else {
                // Here, it's not a paginated result. Before resolving, save the result to storage. If a updatedAfter param
                // was used, merge the result with the previously stored one.
                // This is an async operation, so it doesn't slow down redux
                if (cacheInStorage) {
                    saveApiResultToStorage(apiRequest, result);
                }
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
