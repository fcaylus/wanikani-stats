import {API_ERROR, API_START, API_SUCCESS, ApiResultsState} from './types'
import {AnyAction, combineReducers} from "redux";

/**
 * Reducer handling the data storage in the state of the API calls
 * isNextPage parameter allows to know if the data must be appended to the previous state or not
 */
const apiCallsReducer = (state: ApiResultsState = {}, action: AnyAction): ApiResultsState => {
    switch (action.type) {
        case API_SUCCESS:
            if (action.payload.isNextPage) {
                // Append to previous data
                let newData = state[action.payload.label].data;
                if (Array.isArray(newData)) {
                    newData.push(...action.payload.data);
                } else {
                    // If it's not an array, and all properties from the second object to the first
                    newData = {...newData, ...action.payload.data};
                }

                return {
                    ...state,
                    [action.payload.label]: {
                        fetching: false,
                        error: false,
                        data: newData
                    }
                };
            }

            return {
                ...state,
                [action.payload.label]: {
                    fetching: false,
                    error: false,
                    data: action.payload.data
                }
            };
        case API_ERROR:
            if (action.payload.isNextPage) {
                // Do not remove previous data, just change the fetching parameter
                return {
                    ...state,
                    [action.payload.label]: {
                        ...state[action.payload.label],
                        fetching: false
                    }
                };
            }

            return {
                ...state,
                [action.payload.label]: {
                    fetching: false,
                    error: true,
                    data: action.payload.errorCode
                }
            };
        case API_START:
            return {
                ...state,
                [action.payload.label]: {
                    ...state[action.payload.label],
                    fetching: true,
                    error: false
                }
            };
        default:
            return state;
    }
};

export const apiReducer = combineReducers({
    results: apiCallsReducer
});
