import {RootState} from "../store";
import {ApiRequest, ApiResult} from "./types";
import {labelForApiRequest} from "./util";
import {useSelector} from "react-redux";
import {
    accuracyRequest,
    itemsCountRequest,
    itemsRequest,
    levelsRequest,
    loginRequest,
    progressRequest,
    readyRequest,
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
export const useItemsCountSelector = () => useSelector((state: RootState) => apiResultSelector(state, itemsCountRequest()));
export const useAccuracySelector = () => useSelector((state: RootState) => apiResultSelector(state, accuracyRequest()));
export const useLevelsSelector = () => useSelector((state: RootState) => apiResultSelector(state, levelsRequest()));
export const useReadySelector = () => useSelector((state: RootState) => apiResultSelector(state, readyRequest()));
export const useLoginSelector = () => useSelector((state: RootState) => apiResultSelector(state, loginRequest()));
export const useUserSelector = () => useSelector((state: RootState) => apiResultSelector(state, userRequest()));
export const useItemsSelector = (itemType: string, source: string) => useSelector((state: RootState) => apiResultSelector(state, itemsRequest(itemType, source)));
export const itemsSelector = (state: RootState, itemType: string, source: string) => apiResultSelector(state, itemsRequest(itemType, source));
export const useStatsSelector = (itemType: string, source: string) => useSelector((state: RootState) => apiResultSelector(state, statsRequest(itemType, source)));
export const useProgressSelector = (itemType: string) => useSelector((state: RootState) => apiResultSelector(state, progressRequest(itemType)));
