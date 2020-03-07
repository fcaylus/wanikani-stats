import React from "react";
import Document, {Head, Main, NextScript} from "next/document";
import {ServerStyleSheets} from "@material-ui/core/styles";
import theme from "../src/app/theme";
import postcss from "postcss";
import cssnano from "cssnano";

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

if (!process.browser) {
    var cssMinifier = postcss([cssnano]);
}

MyDocument.getInitialProps = async ctx => {
    // Render app and page and get the context of the page with collected side effects.
    const sheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
        originalRenderPage({
            enhanceApp: App => props => sheets.collect(<App {...props} />),
        });

    const initialProps = await Document.getInitialProps(ctx);

    // Minify MUI CSS is it's a production build
    let css = sheets.toString();
    if (!process.browser && process.env.NODE_ENV === "production") {
        const minified = await cssMinifier.process(css);
        css = minified.css;
    }

    return {
        ...initialProps,
        // Styles fragment is rendered after the app and page rendering finish.
        // @ts-ignore
        styles: [...React.Children.toArray(initialProps.styles),
            <style key="ssr-style"
                   id="jss-server-side"
                // eslint-disable-next-line react/no-danger
                   dangerouslySetInnerHTML={{__html: css}}
            />],
    };
};
