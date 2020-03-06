import {SNACKBAR_HIDDEN, SNACKBAR_HIDE, SNACKBAR_SHOW, SnackbarState} from "./types";
import {AnyAction} from "redux";

/**
 * Reducer that handles the state of the snackbars
 */
export const snackbarReducer = (state: SnackbarState = {}, action: AnyAction): SnackbarState => {
    // On server side, do not change the state and do nothing
    if (!process.browser) {
        return state;
    }

    switch (action.type) {
        case SNACKBAR_SHOW: {
            return {
                ...state,
                [action.payload.key]: {
                    key: action.payload.key,
                    label: action.payload.label,
                    show: true,
                    error: action.payload.error
                }
            }
        }
        case SNACKBAR_HIDE: {
            return {
                ...state,
                [action.payload.key]: {
                    ...state[action.payload.key],
                    show: false
                }
            }
        }
        case SNACKBAR_HIDDEN: {
            delete state[action.payload.key];
            return state;
        }
        default:
            return state;
    }
};
