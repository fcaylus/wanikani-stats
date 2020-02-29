import React, {useEffect} from 'react';
import PageContent from "../src/app/components/PageContent";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../src/app/redux/store";
import {fetchApi} from "../src/app/redux/api/actions";
import {getApiKey} from "../src/app/apiKey";
import redirect, {DEFAULT_REDIRECT_URL} from "../src/redirect";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Box, CircularProgress, Link, Paper, Typography} from "@material-ui/core";
import {useRouter} from "next/router";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: theme.spacing(2)
    },
    progress: {
        margin: theme.spacing(2)
    }
}));

/**
 * Page used to let the user wait while the WaniKani subjects are retrieved (only shown on the first connection of the
 * first user). Regularly checks for the server status and redirect the user when finished.
 */
export default function WaitPage() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const router = useRouter();

    const apiResult = useSelector((state: RootState) => {
        return state.api.results["ready"];
    });

    const checkIfReady = () => {
        setTimeout(() => {
            dispatch(fetchApi("ready", "/api/ready", "GET", getApiKey(), undefined, undefined, true));
        }, 3000);
    };

    useEffect(() => {
        checkIfReady();
    }, []);

    useEffect(() => {
        if (apiResult && !apiResult.error && !apiResult.fetching && apiResult.data) {
            if (apiResult.data.status == "ready") {
                redirect(router.query.redirect ? decodeURI(router.query.redirect.toString()) : DEFAULT_REDIRECT_URL);
            } else {
                console.log("not ready");
                checkIfReady();
            }
        }
    }, [apiResult]);

    return (
        <PageContent pageTitle="Waiting for download ..." showProgress>
            <Paper elevation={5}>
                <Box className={classes.root}>
                    <Typography variant="h5" component={"h1"} gutterBottom>
                        {"\u{1f389} Congratulations ! \u{1f389}"}
                    </Typography>
                    <Typography variant="h6" component={"h2"} gutterBottom>
                        You are the first user since the last reboot of the server !
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        As a reward, you get to wait until all WaniKani items are downloaded. Isn't it amazing ?
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Don't worry, you will be redirected when the process is finished. <br/>
                        Meanwhile, you can take a coffee
                        or watch this&nbsp;
                        <Link href="https://www.youtube.com/watch?v=VFMvNpmOisE" target="_blank">
                            amazing video
                        </Link>
                        &nbsp;of a cat riding on a turtle.
                    </Typography>
                    <CircularProgress variant="indeterminate" className={classes.progress}/>
                </Box>
            </Paper>
        </PageContent>
    );
}
