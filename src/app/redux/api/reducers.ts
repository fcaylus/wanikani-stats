import {API_ERROR, API_START, API_SUCCESS, ApiResultsState} from './types'
import {AnyAction, combineReducers} from "redux";
import {labelForApiRequest} from "./util";

/**
 * Reducer handling the storage of API calls results into the main store.
 */
const apiCallsReducer = (state: ApiResultsState = {}, action: AnyAction): ApiResultsState => {
    /*
     * API_SUCCESS
     */
    if (action.type === API_SUCCESS) {
        const label = labelForApiRequest(action.payload.request);
        // If its a multi page request and not the first page
        if (action.payload.isNextPage) {
            // Append to previous data
            let newData = state[label].data;

            // Append data to the original state, depending if it's an array or an object
            if (Array.isArray(newData)) {
                newData.push(...action.payload.data);
            } else {
                // If it's not an array, and all properties from the second object to the first
                newData = {...newData, ...action.payload.data};
            }

            return {
                ...state,
                [label]: {
                    fetching: false,
                    error: false,
                    data: newData
                }
            };
        }

        // Save new data to the store
        return {
            ...state,
            [label]: {
                fetching: false,
                error: false,
                data: action.payload.data
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
                data: action.payload.errorCode
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
