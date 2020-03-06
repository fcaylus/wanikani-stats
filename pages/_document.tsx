import React from "react";
import Document, {Head, Main, NextScript} from "next/document";
import {ServerStyleSheets} from "@material-ui/core/styles";
import theme from "../src/app/theme";

/**
 * Document structure
 */
export default class MyDocument extends Document {
    render() {
        return (
            <html lang="en">
            <Head>
                <meta charSet="utf-8"/>
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
                    key="viewport"/>
                <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>

                {/* Roboto Font*/}
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
                />

                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
                <link rel="manifest" href="/site.webmanifest"/>

                <meta name="apple-mobile-web-app-title" content={process.env.appName}/>
                <meta name="application-name" content={process.env.appName}/>
                <meta name="msapplication-TileColor" content={theme.palette.primary.main}/>
                <meta name="theme-color" content={theme.palette.primary.main} key="theme-color"/>

                <meta name="robots" content="index,follow"/>
                <meta name="subject" content="wanikani statistics"/>

                <meta name="description" content={process.env.description}/>
            </Head>
            <body>
            <Main/>
            <NextScript/>
            </body>
            </html>
        );
    }
}

MyDocument.getInitialProps = async ctx => {
    // Resolution order
    //
    // On the server:
    // 1. app.getInitialProps
    // 2. page.getInitialProps
    // 3. document.getInitialProps
    // 4. app.render
    // 5. page.render
    // 6. document.render
    //
    // On the server with error:
    // 1. document.getInitialProps
    // 2. app.render
    // 3. page.render
    // 4. document.render
    //
    // On the client
    // 1. app.getInitialProps
    // 2. page.getInitialProps
    // 3. app.render
    // 4. page.render

    // Render app and page and get the context of the page with collected side effects.
    const sheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
        originalRenderPage({
            enhanceApp: App => props => sheets.collect(<App {...props} />),
        });

    const initialProps = await Document.getInitialProps(ctx);

    return {
        ...initialProps,
        // Styles fragment is rendered after the app and page rendering finish.
        // @ts-ignore
        styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
    };
};
