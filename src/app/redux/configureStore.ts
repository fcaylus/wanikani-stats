import {applyMiddleware, createStore, Store} from "redux";
import thunkMiddleware from "redux-thunk";
import {rootReducer} from "./store";
import {MakeStoreOptions} from "next-redux-wrapper";
import {composeWithDevTools} from "redux-devtools-extension/developmentOnly";

/**
 * Configure the main Redux store
 */
export default function configureStore(initialState = {}, _options: MakeStoreOptions): Store {
    const middlewares = [thunkMiddleware];
    const composedEnhancers = composeWithDevTools(applyMiddleware(...middlewares));

    return createStore(rootReducer, initialState, composedEnhancers);
}
