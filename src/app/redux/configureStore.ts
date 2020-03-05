import {applyMiddleware, createStore, Store} from "redux";
import thunkMiddleware from "redux-thunk";
import {rootReducer} from "./reducer";
import {MakeStoreOptions} from "next-redux-wrapper";
import {composeWithDevTools} from "redux-devtools-extension/developmentOnly";
import {saveApiResultToStorage} from "./api/storage";

/**
 * Configure the main Redux store.
 * On servers-side, initialState is always empty.
 * On browser-side, initialState contains potential api data retrieved during SSR.
 */
export default function configureStore(initialState: any = {}, _options: MakeStoreOptions): Store {
    const middlewares = [thunkMiddleware];
    const composedEnhancers = composeWithDevTools(applyMiddleware(...middlewares));

    // If initialState contains data from SSR, try to cache them to the storage.
    // Even if these data shouldn't be stored, it doesn't matter because the cache policy is computed at the request time.
    // So they will just be ignored.
    if (initialState && initialState.api && initialState.api.results) {
        for (const request of Object.keys(initialState.api.results)) {
            const result = initialState.api.results[request];
            if (result && result.data && result.when && !result.error && !result.fetching) {
                // Store it in the storage
                saveApiResultToStorage(JSON.parse(request), result);
            }
        }
    }

    return createStore(rootReducer, initialState, composedEnhancers);
}
