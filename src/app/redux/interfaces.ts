import {AppInitialProps} from "next/app";
import {AnyAction, Store} from "redux";
import {NextPageContext} from "next";
import {ThunkDispatch} from "redux-thunk";

interface AppStore extends Store {
    dispatch: ThunkDispatch<any, any, AnyAction>;
}

export interface AppWithStore extends AppInitialProps {
    store: AppStore;
}

export interface ReduxNextPageContext extends NextPageContext {
    store: AppStore;
}
