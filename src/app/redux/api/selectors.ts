import {RootState} from "../reducer";
import {ApiRequest, ApiResult} from "./types";
import {labelForApiRequest} from "./util";
import {useSelector} from "react-redux";
import {
    itemsRequest,
    levelsRequest,
    loginRequest,
    progressRequest,
    readyRequest,
    reviewsStatsRequest,
    statsRequest,
    statusRequest,
    userRequest
} from "./requests";

/**
 * Basic selector used to retrieve an ApiResult object from the store. All others selectors and selectors hook are
 * just wrapper around this one.
 */
export const apiResultSelector = (state: RootState, request: ApiRequest): ApiResult => {
    return state.api.results[labelForApiRequest(request)];
};

export const useStatusSelector = () => useSelector((state: RootState) => apiResultSelector(state, statusRequest()));
export const useLevelsSelector = () => useSelector((state: RootState) => apiResultSelector(state, levelsRequest()));
export const useReadySelector = () => useSelector((state: RootState) => apiResultSelector(state, readyRequest()));
export const useLoginSelector = () => useSelector((state: RootState) => apiResultSelector(state, loginRequest()));
export const useUserSelector = () => useSelector((state: RootState) => apiResultSelector(state, userRequest()));
export const useItemsSelector = (itemType: string, source: string) => useSelector((state: RootState) => apiResultSelector(state, itemsRequest(itemType, source)));
export const itemsSelector = (state: RootState, itemType: string, source: string) => apiResultSelector(state, itemsRequest(itemType, source));
export const useStatsSelector = (itemType: string, source: string) => useSelector((state: RootState) => apiResultSelector(state, statsRequest(itemType, source)));
export const useProgressSelector = (itemType: string) => useSelector((state: RootState) => apiResultSelector(state, progressRequest(itemType)));
export const progressSelector = (state: RootState, itemType: string) => apiResultSelector(state, progressRequest(itemType));
export const useReviewsStatsSelector = () => useSelector((state: RootState) => apiResultSelector(state, reviewsStatsRequest()));
export const reviewsStatsSelector = (state: RootState) => apiResultSelector(state, reviewsStatsRequest());

/**
 * Checks if the specified result is successful
 */
export const isResultSuccessful = (result?: ApiResult) => {
    return result && !result.error && !result.fetching;
};

/**
 * Checks if a result is fetching
 */
export const isResultFetching = (result?: ApiResult) => {
    return !result || result.fetching;
};

/**
 * Checks if the result need to be fetched
 */
export const needResultFetching = (result?: ApiResult) => {
    return !result || result.error;
};
