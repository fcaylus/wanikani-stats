import React, {useEffect} from 'react';
import PageContent from "../src/app/components/page/PageContent";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../src/app/redux/store";
import {ApiResultState} from "../src/app/redux/api/types";
import {fetchApi} from "../src/app/redux/api/actions";
import {getApiKey, hasApiKey} from "../src/app/apiKey";
import StatusCard from "../src/app/components/progress/StatusCard";
import {ReduxNextPageContext} from "../src/app/redux/interfaces";
import redirect from "../src/redirect";
import {IncomingMessage, ServerResponse} from "http";
import ItemsCountGrid from "../src/app/components/progress/ItemsCountGrid";
import AccuracyCard from "../src/app/components/progress/AccuracyCard";
import {Grid} from "@material-ui/core";
import LevelsDurationChart from "../src/app/components/progress/LevelsDurationChart";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        "& > *": {
            marginBottom: theme.spacing(2)
        }
    },
    grid: {
        "& > *": {
            minWidth: 400,
            [theme.breakpoints.down(450)]: {
                minWidth: 300
            },
            [theme.breakpoints.down(350)]: {
                minWidth: 200
            },
            "& > *": {
                height: "100%"
            }
        }
    }
}));

const fetchStatus = (req?: IncomingMessage, res?: ServerResponse) => {
    return fetchApi("status", "/api/user/status", "GET", getApiKey(req), undefined, undefined, undefined, req, res);
};
const fetchItemsCount = () => {
    return fetchApi("progress/count", "/api/progress/count", "GET", getApiKey());
};
const fetchAccuracy = () => {
    return fetchApi("progress/accuracy", "/api/progress/accuracy", "GET", getApiKey());
};
const fetchLevels = () => {
    return fetchApi("progress/levels", "/api/progress/levels", "GET", getApiKey());
};

/**
 * Home page of the app.
 * Simply dispatch all the API request and render a grid of sub components using these API data.
 */
export default function IndexPage() {
    const classes = useStyles();

    const dispatch = useDispatch();
    const statusResult: ApiResultState = useSelector((state: RootState) => {
        return state.api.results["status"];
    });
    const itemsCountResult: ApiResultState = useSelector((state: RootState) => {
        return state.api.results["progress/count"];
    });
    const accuracyResult: ApiResultState = useSelector((state: RootState) => {
        return state.api.results["progress/accuracy"];
    });
    const levelsResult: ApiResultState = useSelector((state: RootState) => {
        return state.api.results["progress/levels"];
    });

    useEffect(() => {
        if (!statusResult || statusResult.error) {
            dispatch(fetchStatus());
        }
        if (!itemsCountResult || itemsCountResult.error) {
            dispatch(fetchItemsCount());
        }
        if (!accuracyResult || accuracyResult.error) {
            dispatch(fetchAccuracy());
        }
        if (!levelsResult || levelsResult.error) {
            dispatch(fetchLevels());
        }
    }, []);

    return (
        <PageContent className={classes.root}
                     showProgress={
                         !statusResult
                         || statusResult.fetching
                         || !itemsCountResult
                         || itemsCountResult.fetching
                         || !accuracyResult
                         || accuracyResult.fetching
                         || !levelsResult
                         || levelsResult.fetching}>
            <ItemsCountGrid
                itemsCount={itemsCountResult && !itemsCountResult.fetching && !itemsCountResult.error ? itemsCountResult.data : undefined}/>

            <Grid container spacing={2} className={classes.grid}>
                <Grid item xs>
                    <StatusCard
                        status={statusResult && !statusResult.fetching && !statusResult.error ? statusResult.data : undefined}
                        itemsCount={itemsCountResult && !itemsCountResult.fetching && !itemsCountResult.error ? itemsCountResult.data : undefined}
                        levelsProgression={levelsResult && !levelsResult.fetching && !levelsResult.error ? levelsResult.data : undefined}/>
                </Grid>
                {accuracyResult && !accuracyResult.fetching && !accuracyResult.error && (
                    <Grid item xs>
                        <AccuracyCard
                            accuracy={accuracyResult && !accuracyResult.fetching && !accuracyResult.error ? accuracyResult.data : undefined}/>
                    </Grid>
                )}
            </Grid>
            <Grid container spacing={2} className={classes.grid}>
                {levelsResult && !levelsResult.fetching && !levelsResult.error && (
                    <Grid item xs>
                        <LevelsDurationChart
                            levels={levelsResult && !levelsResult.fetching && !levelsResult.error ? levelsResult.data : undefined}/>
                    </Grid>
                )}
            </Grid>
        </PageContent>
    );
}

// Server-side rendering
IndexPage.getInitialProps = async (ctx: ReduxNextPageContext) => {
    // Check if logged
    if (!hasApiKey(ctx.req)) {
        redirect("/login", ctx.req, ctx.res, false, true);
        return {};
    }

    // Wait for the API call to finished.
    if (!process.browser) {
        await ctx.store.dispatch(fetchStatus(ctx.req, ctx.res));
    }

    return {}
};

