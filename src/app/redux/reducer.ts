import {combineReducers} from "redux";
import {apiReducer} from "./api/reducers";
import {snackbarReducer} from "./snackbar/reducers";

export const rootReducer = combineReducers({
    api: apiReducer,
    snackbar: snackbarReducer
});

export type RootState = ReturnType<typeof rootReducer>
