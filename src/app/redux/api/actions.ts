import {API_ERROR, API_START, API_SUCCESS, ApiActionTypes} from "./types";
import {AnyAction} from "redux";
import axios from "axios";
import {ACCEPTED, INTERNAL_SERVER_ERROR, UNAUTHORIZED} from "http-status-codes";
import {RootState} from "../store";
import {PaginatedEndpointResult} from "../../../server/interfaces/paginated";
import {ThunkDispatch} from "redux-thunk";
import redirect from "../../../redirect";
import {IncomingMessage, ServerResponse} from "http";

/**
 * Action sent when an API fetch is started
 */
export const apiStart = (label: string, isNextPage?: boolean): ApiActionTypes => {
    return {
        type: API_START,
        payload: {
            label,
            isNextPage: !!isNextPage
        }
    }
};

/**
 * Action sent when an API fetch end with error
 */
export const apiError = (url: string, label: string, errorCode: number, isNextPage?: boolean): ApiActionTypes => {
    return {
        type: API_ERROR,
        payload: {
            url,
            label,
            errorCode,
            isNextPage: !!isNextPage
        }
    }
};

/**
 * Action sent when an API fetch end with success
 */
export const apiSuccess = (label: string, data: any, isNextPage?: boolean): ApiActionTypes => {
    return {
        type: API_SUCCESS,
        payload: {
            label,
            data,
            isNextPage: !!isNextPage
        }
    }
};

/**
 * Fetch the corresponding local API endpoint based on the desired item type and source.
 * Returns a Thunk.
 *
 * @param label Label used to store the data in the global redux state
 * @param url Url of the targeted endpoint
 * @param method HTTP method
 * @param apiKey The user token
 * @param data Optional data to send to the API
 * @param isNextPage Optional param that tells if the page is not the first one (and thus that the retrieved data need
 * to be append to the store).
 * @param apiKey Optional apiKey. Useful for the login page when the token is not stored yet in cookies.
 * @param noCache If specified, fetch the data even if it's stored in the store
 * @param req Optional request object. Used to redirect on the server side in case the WK data are not ready
 * @param res Optional response object. Used to redirect on the server side in case the WK data are not ready
 */
export const fetchApi = (label: string,
                         url: string,
                         method: string,
                         apiKey: string | undefined,
                         data?: any,
                         isNextPage?: boolean,
                         noCache?: boolean,
                         req?: IncomingMessage,
                         res?: ServerResponse) => {
    const baseUrl = process.browser ? "" : "http://localhost:3000";

    return (dispatch: ThunkDispatch<any, any, AnyAction>, getState: () => RootState) => {
        if (!isNextPage) {
            // Check if the label is already retrieved, only if it's the first page
            // If noCache is specified, ignore this
            const results = getState().api.results[label];
            if (!noCache && results && !results.error) {
                // Data is already in store
                // The API_SUCCESS action will be triggered by another action
                return Promise.resolve();
            }
        }

        // Otherwise, get the data from the API
        return fetchData(dispatch, url, method, apiKey, label, baseUrl, data, isNextPage, req, res);
    }
};

const fetchData = (dispatch: ThunkDispatch<any, any, AnyAction>,
                   url: string,
                   method: string,
                   accessToken: string | undefined,
                   label: string,
                   baseUrl: string,
                   data?: any,
                   isNextPage?: boolean,
                   req?: IncomingMessage,
                   res?: ServerResponse) => {
    dispatch(apiStart(label, isNextPage));

    return new Promise((resolve, reject) => {
        // The name of axios field changes depending on the method
        const dataOrParams = ["GET", "DELETE"].includes(method) ? "params" : "data";

        axios.request({
            baseURL: baseUrl,
            url,
            method,
            headers: {
                "content-type": "application/json",
                "authorization": accessToken ? "Bearer " + accessToken : undefined
            },
            [dataOrParams]: data
        }).then(response => {
            // If the response code is ACCEPTED, this means the server is downloading WK subjects. Redirect the user to a
            // waiting page
            if (response.status === ACCEPTED) {
                redirect("/wait", req, res, false, true);
                resolve();
                return;
            }

            // If it's a paginated result, also trigger a API_NEXT_PAGE action.
            // In this case, the next page url is parsed and a new fetch is performed.
            // Only the actual data is saved to the store
            if (response.data.hasNextPage !== undefined) {
                // This is a paginated result
                const paginatedResult: PaginatedEndpointResult = response.data;
                if (paginatedResult.hasNextPage && paginatedResult.nextPageUrl) {
                    dispatch(apiSuccess(label, paginatedResult.data, isNextPage));
                    dispatch(fetchApi(label, paginatedResult.nextPageUrl, method, accessToken, undefined, true));

                    // Resolve after each page
                    resolve();
                    return;
                }
                dispatch(apiSuccess(label, paginatedResult.data, isNextPage));
            } else {
                dispatch(apiSuccess(label, response.data, isNextPage));
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

            dispatch(apiError(url, label, errorCode, isNextPage));
            reject();
        });
    });
};
