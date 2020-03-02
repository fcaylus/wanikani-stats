import React, {useEffect} from 'react';
import PageContent from "../src/app/components/PageContent";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../src/app/redux/store";
import {ApiResultState} from "../src/app/redux/api/types";
import {fetchApi} from "../src/app/redux/api/actions";
import {getApiKey, hasApiKey} from "../src/app/apiKey";
import StatusCard from "../src/app/components/StatusCard";
import {ReduxNextPageContext} from "../src/app/redux/interfaces";
import redirect from "../src/redirect";
import {IncomingMessage, ServerResponse} from "http";
import ItemsCountGrid from "../src/app/components/ItemsCountGrid";
import AccuracyCard from "../src/app/components/AccuracyCard";
import {Grid} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        "& > *": {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2)
        },
        "& > *:first-child": {
            marginTop: "unset"
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

/**
 * Home page of the app
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
    }, []);

    return (
        <PageContent className={classes.root}
                     showProgress={
                         !statusResult
                         || statusResult.fetching
                         || !itemsCountResult
                         || itemsCountResult.fetching
                         || !accuracyResult
                         || accuracyResult.fetching}>
            <ItemsCountGrid
                itemsCount={itemsCountResult && !itemsCountResult.fetching && !itemsCountResult.error ? itemsCountResult.data : undefined}/>

            <Grid container spacing={2}>
                <Grid item xs>
                    <StatusCard
                        status={statusResult && !statusResult.fetching && !statusResult.error ? statusResult.data : undefined}
                        itemsCount={itemsCountResult && !itemsCountResult.fetching && !itemsCountResult.error ? itemsCountResult.data : undefined}/>
                </Grid>
                {accuracyResult && !accuracyResult.fetching && !accuracyResult.error && (
                    <Grid item xs>
                        <AccuracyCard
                            accuracy={accuracyResult && !accuracyResult.fetching && !accuracyResult.error ? accuracyResult.data : undefined}/>
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

