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
    },
    image: {
        maxWidth: 100,
        maxHeight: 100,
        objectFit: "contain"
    }
}));

const fetchStatus = (req?: IncomingMessage, res?: ServerResponse) => {
    return fetchApi("status", "/api/user/status", "GET", getApiKey(req), undefined, undefined, undefined, req, res);
};
const fetchItemsCount = (req?: IncomingMessage, res?: ServerResponse) => {
    return fetchApi("progress/count", "/api/progress/count", "GET", getApiKey(req), undefined, undefined, undefined, req, res);
};


export default function IndexPage() {
    const classes = useStyles();

    const dispatch = useDispatch();
    const statusResult: ApiResultState = useSelector((state: RootState) => {
        return state.api.results["status"];
    });
    const itemsCountResult: ApiResultState = useSelector((state: RootState) => {
        return state.api.results["items/count"];
    });

    useEffect(() => {
        if (!statusResult || statusResult.error) {
            dispatch(fetchStatus());
            dispatch(fetchItemsCount());
        }
    }, []);

    return (
        <PageContent className={classes.root} showProgress={!statusResult || statusResult.fetching}>
            <ItemsCountGrid
                itemsCount={itemsCountResult && !itemsCountResult.fetching && !itemsCountResult.error ? itemsCountResult.data : undefined}/>
            <StatusCard
                status={statusResult && !statusResult.fetching && !statusResult.error ? statusResult.data : undefined}
                itemsCount={itemsCountResult && !itemsCountResult.fetching && !itemsCountResult.error ? itemsCountResult.data : undefined}/>

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
        await ctx.store.dispatch(fetchItemsCount(ctx.req, ctx.res));
    } else {
        ctx.store.dispatch(fetchStatus());
        ctx.store.dispatch(fetchItemsCount());
    }

    return {}
};

