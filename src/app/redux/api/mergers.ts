import {ApiResult} from "./types";
import {isResultSuccessful} from "./selectors";

/**
 * Merger type.
 * "Merger" function are use to merge api result with the previously stored result in the localforage.
 * This allows the usage of "updated_after" query param when sending request to WK.
 * NOTE: This is different from the "merging" step of paginated result. Merger are only apply to the storage, so for
 * non-paginated result or for the first page of a paginated result.
 */
export type Merger = (previousResult: ApiResult, newResult: ApiResult) => ApiResult;

/**
 * Merger for list elements. Simply append new elements to the stored list.
 */
export const listMerger: Merger = (previousResult, newResult) => {
    if (!isResultSuccessful(previousResult) || !isResultSuccessful(newResult)) {
        return previousResult;
    }

    return {
        error: false,
        fetching: false,
        when: newResult.when,
        data: [
            ...previousResult.data,
            ...newResult.data
        ]
    }
};

/**
 * Merger that replace the previous list with the new one (only if not empty)
 */
export const listReplaceMerger: Merger = (previousResult, newResult) => {
    if (!isResultSuccessful(previousResult) || !isResultSuccessful(newResult) || newResult.data.length <= 0) {
        return previousResult;
    }
    return newResult;
};

/**
 * Merger for hash map objects. Append new properties to the stored object.
 */
export const hashMapObjectMerger: Merger = (previousResult, newResult) => {
    if (!isResultSuccessful(previousResult) || !isResultSuccessful(newResult)) {
        return previousResult;
    }

    return {
        error: false,
        fetching: false,
        when: newResult.when,
        data: {
            ...previousResult.data,
            ...newResult.data
        }
    }
};

/**
 * Merger that replace the previous hash map with the new one (only if not empty, ie. if newResult.data has keys)
 */
export const hashMapObjectReplaceMerger: Merger = (previousResult, newResult) => {
    if (!isResultSuccessful(previousResult) || !isResultSuccessful(newResult) || Object.keys(newResult.data).length <= 0) {
        return previousResult;
    }
    return newResult;
};
