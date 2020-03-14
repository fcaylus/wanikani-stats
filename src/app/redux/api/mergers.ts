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
 * Merger for hash map objects. Append new properties to the stored object. If some properties have the same key,
 * they are override.
 */
export const hashMapObjectMerger: Merger = (previousResult, newResult) => {
    if (!isResultSuccessful(previousResult) || !isResultSuccessful(newResult)) {
        return previousResult;
    }

    // If new result is "empty", just return the old one
    // This avoid updating the "when" parameter when nothing new is available.
    if (Object.keys(newResult.data).length === 0) {
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
 * Merger that replace the previous data object with the new one (only if not null)
 */
export const objectReplaceMerger: Merger = (previousResult, newResult) => {
    if (!isResultSuccessful(previousResult) || !isResultSuccessful(newResult) || !newResult.data) {
        return previousResult;
    }
    return newResult;
};
