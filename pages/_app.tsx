import React from 'react';
import App from 'next/app';
import {ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../src/app/theme';
import Page from "../src/app/components/Page";
import {Provider} from "react-redux";
import configureStore from "../src/app/redux/configureStore";
import withRedux from "next-redux-wrapper";
import {AppWithStore} from "../src/app/redux/interfaces";

/**
 * Main App component
 */
class WebApp extends App<AppWithStore> {
    componentDidMount() {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles && jssStyles.parentElement) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    }

    // Render the main component
    render() {
        const {store} = this.props;

        return (
            <Provider store={store}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <Page {...this.props} />
                </ThemeProvider>
            </Provider>
        );
    }
}

export default withRedux(configureStore)(WebApp);
