import React, {useState} from 'react';
import {makeStyles, Theme} from '@material-ui/core/styles';
import {AppProps} from "next/app";
import PageHeader from "./PageHeader";
import PageFooter from "./PageFooter";
import PageNav from "./PageNav";
import {Box} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "row"
    },
    offset: theme.mixins.toolbar
}));

/**
 * Default page component used by the app
 */
export default function Page(props: AppProps) {
    const classes = useStyles();
    const {Component, pageProps} = props;

    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleDrawer = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box className={classes.root}>
            <PageHeader toggleDrawer={toggleDrawer}/>
            <PageNav toggleDrawer={toggleDrawer} mobileOpen={mobileOpen}/>
            <Box>
                <div className={classes.offset}/>
                <Component {...pageProps} />
                <PageFooter/>
            </Box>
        </Box>
    );
}
