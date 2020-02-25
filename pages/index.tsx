import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '../src/app/components/Link';
import PageContent from "../src/app/components/PageContent";

// TODO: change this page
export default function Index() {
    return (
        <PageContent pageTitle="Home">
            <Typography variant="h4" component="h1" gutterBottom>
                Next.js example
            </Typography>
            <Link href="/about" color="secondary">
                Go to the about page
            </Link>
        </PageContent>
    );
}
