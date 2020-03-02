import React, {useState} from 'react';
import {makeStyles, Theme} from '@material-ui/core/styles';
import {AppProps} from "next/app";
import PageHeader from "./PageHeader";
import PageFooter from "./PageFooter";
import PageNav from "./PageNav";
import {Box} from "@material-ui/core";
import {useRouter} from "next/router";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "row"
    },
    offset: theme.mixins.toolbar,
    mainContainer: {
        width: "100%"
    }
}));

/**
 * Default page component used by the app
 */
export default function Page(props: AppProps) {
    const classes = useStyles();
    const router = useRouter();
    const {Component, pageProps} = props;

    // For /login and /wait, only display a minimal page
    const minimal = router.pathname == "/login" || router.pathname == "/wait";

    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleDrawer = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box className={classes.root}>
            <PageHeader toggleDrawer={toggleDrawer} minimal={minimal}/>
            {!minimal && <PageNav toggleDrawer={toggleDrawer} mobileOpen={mobileOpen}/>}
            <Box className={classes.mainContainer}>
                <div className={classes.offset}/>
                <Component {...pageProps} />
                <PageFooter/>
            </Box>
        </Box>
    );
}
