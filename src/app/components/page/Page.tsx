import React, {useEffect, useState} from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {AppProps} from "next/app";
import PageHeader from "./PageHeader";
import PageFooter from "./PageFooter";
import PageNav from "./PageNav";
import {Box} from "@material-ui/core";
import {useRouter} from "next/router";
import {useSnackbar} from "notistack";
import {useDispatch, useSelector} from "react-redux";
import {Snackbar} from "../../redux/snackbar/types";
import {RootState} from "../../redux/reducer";
import {removeSnackbar} from "../../redux/snackbar/actions";

const useStyles = makeStyles((theme: Theme) => ({
    offset: theme.mixins.toolbar,
    mainContainer: {
        width: "100%"
    }
}));

let shownSnackbars: Snackbar[] = [];

/**
 * Default page component used by the app
 */
export default function Page(props: AppProps) {
    const classes = useStyles();
    const router = useRouter();
    const {Component, pageProps} = props;

    // For /login and /wait, only display a minimal page
    const minimal = router.pathname == "/login" || router.pathname == "/wait";

    /**
     * Manage the list of snackbars
     */
    const snackbar = useSnackbar();
    const dispatch = useDispatch();

    const snackbarsInState = useSelector((state: RootState) => {
        return state.snackbar;
    });

    useEffect(() => {
        // Find the list of snackbars to open
        const toOpen = Object.values(snackbarsInState).filter(value => value.show && !shownSnackbars.includes(value));
        for (const snack of toOpen) {
            snackbar.enqueueSnackbar(snack.label, {
                key: snack.key,
                persist: true,
                variant: snack.error ? "error" : "default"
            });
        }
        shownSnackbars.push(...toOpen);
    }, [snackbarsInState]);

    useEffect(() => {
        // Find the snack bars to hide
        const toHide = Object.values(snackbarsInState).filter(value => !value.show);
        for (const snack of toHide) {
            snackbar.closeSnackbar(snack.key);
            dispatch(removeSnackbar(snack.key));
        }
        shownSnackbars = shownSnackbars.filter(value => !toHide.includes(value));
    }, [snackbarsInState]);

    /**
     * Manage the state of the navigation drawer
     */
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleDrawer = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <React.Fragment>
            <PageHeader toggleDrawer={toggleDrawer} minimal={minimal}/>
            {!minimal && <PageNav toggleDrawer={toggleDrawer} mobileOpen={mobileOpen}/>}
            <Box className={classes.mainContainer}>
                <div className={classes.offset}/>
                <Component {...pageProps} />
                <PageFooter/>
            </Box>
        </React.Fragment>
    );
}
