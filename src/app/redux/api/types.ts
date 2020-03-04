import {Action} from "redux";

/**
 * A request that can be handled by fetchApi()
 */
export interface ApiRequest {
    endpoint: string;
    method: string;
    data?: any;
}

/**
 * A result from an API request
 */
export interface ApiResult {
    data?: any;
    fetching: boolean;
    error: boolean;
    // The date when the response was received
    when?: Date;
}

/**
 * State type under "store.state.api.results"
 */
export interface ApiResultsState {
    // Labels are auto generated depending on the ApiRequest object
    [requestLabel: string]: ApiResult;
}

export const API_START = "API_START";
export const API_ERROR = "API_ERROR";
export const API_SUCCESS = "API_SUCCESS";

/**
 * Action called when a request start. If cache is enable and the result is already stored, this action is never send.
 * If the result is paginated, this action is called for every page.
 */
interface ApiStartAction extends Action<typeof API_START> {
    payload: {
        request: ApiRequest;
        isNextPage: boolean;
    }
}

/**
 * Action called when a request ends with error
 */
interface ApiErrorAction extends Action<typeof API_ERROR> {
    payload: {
        request: ApiRequest;
        errorCode: number;
        when: Date;
        isNextPage: boolean;
    }
}

/**
 * Action called when a request ends with success. If the result is paginated, this action is called for every page.
 */
interface ApiSuccessAction extends Action<typeof API_SUCCESS> {
    payload: {
        request: ApiRequest;
        data: any;
        when: Date;
        isNextPage: boolean;
    }
}

export type ApiActionTypes =
    ApiStartAction
    | ApiErrorAction
    | ApiSuccessAction;
