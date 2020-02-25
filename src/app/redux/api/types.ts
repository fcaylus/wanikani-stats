import {Action} from "redux";

export interface ApiResultState {
    data?: any;
    fetching: boolean;
    error: boolean;
}

export interface ApiResultsState {
    [label: string]: ApiResultState;
}

export const API_START = "API_START";
export const API_ERROR = "API_ERROR";
export const API_SUCCESS = "API_SUCCESS";

interface ApiStartAction extends Action<typeof API_START> {
    payload: {
        label: string;
        isNextPage: boolean;
    }
}

interface ApiErrorAction extends Action<typeof API_ERROR> {
    payload: {
        url: string;
        label: string;
        errorCode: number;
        isNextPage: boolean;
    }
}

interface ApiSuccessAction extends Action<typeof API_SUCCESS> {
    payload: {
        label: string;
        data: any;
        isNextPage: boolean;
    }
}

export type ApiActionTypes =
    ApiStartAction
    | ApiErrorAction
    | ApiSuccessAction;
