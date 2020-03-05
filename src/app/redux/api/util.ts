import {ApiRequest, ApiResult} from "./types";

/**
 * Generate a label based on the request. The label is used as a key identifier for results in the
 * redux store and the storage.
 */
export const labelForApiRequest = (request: ApiRequest): string => {
    // If request.endpoint is a full url, only use the pathname to generate the label. This case happens for
    // paginated results
    return JSON.stringify({
        ...request,
        endpoint: request.endpoint.startsWith("/") ? request.endpoint : (new URL(request.endpoint)).pathname
    });
};

/**
 * Merge new paginated data with the previous one (if found). If new data is not an Array, it assumed it is an indexable object.
 * NOTE: this is different from the Mergers, since this function only operates on paginated result to merge it with the
 * redux store, and not the local storage.
 */
export const mergePaginatedResultWithStore = (original: ApiResult | undefined, newData: any, when?: Date): ApiResult => {
    // Append to previous data
    let result = original ? original.data : undefined;

    // Append data to the original result, depending if it's an array or an object
    if (!result) {
        result = newData;
    } else if (Array.isArray(newData)) {
        result.push(...newData);
    } else {
        // If it's not an array, and all properties from the second object to the first
        result = {...result, ...newData};
    }

    return {
        fetching: false,
        error: false,
        data: result,
        when: when
    }
};
