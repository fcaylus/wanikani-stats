import {API_ERROR, API_START, API_SUCCESS, ApiResultsState} from './types'
import {AnyAction, combineReducers} from "redux";
import {labelForApiRequest, mergePaginatedResultWithStore} from "./util";

/**
 * Reducer handling the storage of API calls results into the main store.
 */
const apiCallsReducer = (state: ApiResultsState = {}, action: AnyAction): ApiResultsState => {
    /*
     * API_SUCCESS
     */
    if (action.type === API_SUCCESS) {
        const label = labelForApiRequest(action.payload.request);
        // If its a multi page request and not the first page, merge the data
        if (action.payload.isNextPage) {
            return {
                ...state,
                [label]: mergePaginatedResultWithStore(state[label], action.payload.data, action.payload.when)
            }
        }

        // Save new data to the store
        return {
            ...state,
            [label]: {
                fetching: false,
                error: false,
                data: action.payload.data,
                when: action.payload.when
            }
        };
    }
    /*
     * API_ERROR
     */
    else if (action.type === API_ERROR) {
        const label = labelForApiRequest(action.payload.request);

        if (action.payload.isNextPage) {
            // Do not remove previous data, just change the fetching parameter
            return {
                ...state,
                [label]: {
                    ...state[label],
                    fetching: false
                }
            };
        }

        // Remove previous data in case of error
        return {
            ...state,
            [label]: {
                fetching: false,
                error: true,
                data: action.payload.errorCode,
                when: action.payload.when
            }
        };
    }
    /*
     * API_START
     */
    else if (action.type === API_START) {
        const label = labelForApiRequest(action.payload.request);

        // Change only fetching and error properties.
        return {
            ...state,
            [label]: {
                ...state[label],
                fetching: true,
                error: false
            }
        };
    } else {
        return state;
    }
};

export const apiReducer = combineReducers({
    results: apiCallsReducer
});
