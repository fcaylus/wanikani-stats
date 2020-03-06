import {Action} from "redux";

/**
 * Snackbar information
 */
export interface Snackbar {
    key: string;
    label: string;
    show: boolean;
    error: boolean;
}

/**
 * State type under "store.state.snackbar"
 */
export interface SnackbarState {
    [key: string]: Snackbar;
}

export const SNACKBAR_SHOW = "SNACKBAR_SHOW";
export const SNACKBAR_HIDE = "SNACKBAR_HIDE";
export const SNACKBAR_HIDDEN = "SNACKBAR_HIDDEN";

/**
 * Action sends when a new snack should be shown
 */
interface SnackbarShowAction extends Action<typeof SNACKBAR_SHOW> {
    payload: {
        key: string,
        label: string,
        error: boolean
    }
}

/**
 * Action to hide a snackbar
 */
interface SnackbarHideAction extends Action<typeof SNACKBAR_HIDE> {
    payload: {
        key: string
    }
}

/**
 * Action sent when the snackbar was successfully hidden. Used to remove the Snackbar from the store
 */
interface SnackbarHiddenAction extends Action<typeof SNACKBAR_HIDDEN> {
    payload: {
        key: string
    }
}

export type SnackbarActionTypes = SnackbarShowAction | SnackbarHideAction | SnackbarHiddenAction;
