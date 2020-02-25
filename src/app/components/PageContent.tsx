import React from 'react';
import Head from "next/head";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";

interface PageContentProps {
    pageTitle?: string;

    // Random properties
    [prop: string]: any;
}

/**
 * Each page under /pages/ should use this component as a base.
 * It handles the title and the main page layout.
 */
export default function PageContent(props: PageContentProps) {
    return (
        <React.Fragment>
            <Head>
                <title>
                    {process.env.appName}
                    {props.pageTitle && " - " + props.pageTitle}
                </title>
            </Head>
            <Container component="main" role="main" disableGutters>
                {/* Vertical spacing */}
                <Box m={3} className={props.className}>
                    {props.children}
                </Box>
            </Container>
        </React.Fragment>
    );
}
