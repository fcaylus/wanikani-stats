import {SNACKBAR_HIDDEN, SNACKBAR_HIDE, SNACKBAR_SHOW, SnackbarActionTypes} from "./types";

/**
 * Create an action to show a snackbar
 */
export const showSnackbar = (key: string, label: string, error?: boolean): SnackbarActionTypes => {
    return {
        type: SNACKBAR_SHOW,
        payload: {
            key: key,
            label: label,
            error: !!error
        }
    }
};

/**
 * Create an action to hide a snackbar
 */
export const hideSnackbar = (key: string): SnackbarActionTypes => {
    return {
        type: SNACKBAR_HIDE,
        payload: {
            key: key,
        }
    }
};

/**
 * Create an action to remove a snackbar
 */
export const removeSnackbar = (key: string): SnackbarActionTypes => {
    return {
        type: SNACKBAR_HIDDEN,
        payload: {
            key: key,
        }
    }
};

