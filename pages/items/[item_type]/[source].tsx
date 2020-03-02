import React, {useCallback, useEffect, useState} from 'react';
import PageContent from "../../../src/app/components/page/PageContent";
import {useRouter} from "next/router";
import {INTERNAL_SERVER_ERROR, NOT_FOUND} from "http-status-codes";
import Error from 'next/error'
import {CircularProgress, Theme} from '@material-ui/core';
import {makeStyles} from "@material-ui/core/styles";
import {useDispatch, useSelector} from "react-redux";
import {fetchApi} from "../../../src/app/redux/api/actions";
import {RootState} from "../../../src/app/redux/store";
import {ApiResultState} from "../../../src/app/redux/api/types";
import {ReduxNextPageContext} from "../../../src/app/redux/interfaces";
import redirect from "../../../src/redirect";
import {itemTypeExists, sourceExistsForItemType} from "../../../src/data/data";
import {getApiKey, hasApiKey} from "../../../src/app/apiKey";
import {IncomingMessage, ServerResponse} from "http";
import SourceSelector from "../../../src/app/components/SourceSelector";
import TypeSelector from "../../../src/app/components/TypeSelector";
import CategoryList from "../../../src/app/components/items/CategoryList";

// Create a label based on the specified query
const labelFromItemTypeAndSource = (itemType: string, source: string) => {
    return "items/" + itemType + "/" + source;
};

// Wrapper around the fetchApi() redux action
const fetchItems = (itemType: string, source: string, req?: IncomingMessage, res?: ServerResponse) => {
    const label = labelFromItemTypeAndSource(itemType, source);
    const url = "/api/" + label;
    return fetchApi(label, url, "GET", getApiKey(req), undefined, undefined, undefined, req, res);
};

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        "& > *:first-child": {
            marginBottom: theme.spacing(3)
        }
    },
    fetching: {
        margin: theme.spacing(3),
        marginRight: "auto",
        marginLeft: "auto"
    }
}));

interface ItemPageProps {
    initialDataLength: number
}

/**
 * Render a page with the list of items and their progress.
 * All the data are retrieved from /api/items/* endpoints
 */
function ItemPage(props: ItemPageProps) {
    const router = useRouter();
    const classes = useStyles();

    const [itemType, setItemType] = useState(router.query.item_type.toString());
    const [itemSource, setItemSource] = useState(router.query.source.toString());

    /*
     * API items results state and selector
     */
    const dispatch = useDispatch();
    const apiLabel = labelFromItemTypeAndSource(itemType, itemSource);
    const apiResults: ApiResultState = useSelector((state: RootState) => {
        return state.api.results[apiLabel];
    });
    // Allow to avoid a full re-render of all items just before the url change
    const [showItems, setShowItems] = useState(true);

    /*
     * API user progress results state and selector
     */
    const progressApiLabel = "progress/" + itemType;
    const progressResults: ApiResultState = useSelector((state: RootState) => {
        return state.api.results[progressApiLabel];
    });

    // Controls the main progress bar
    const [isLoading, setLoading] = useState(true);

    // Use to schedule the change of url AFTER the last renders that removes every items from the list
    const [needNewUrl, setNeedNewUrl] = useState<any>(undefined);

    // If a new url is scheduled, redirect to it.
    useEffect(() => {
        if (needNewUrl) {
            setNeedNewUrl(undefined);
            changeUrl(needNewUrl.type, needNewUrl.source, true);
        }
    }, [needNewUrl]);

    // When the page query change, update the component state
    useEffect(() => {
        const {item_type, source} = router.query;
        if (item_type.toString() != itemType) {
            setItemType(item_type.toString());
        }
        if (source.toString() != itemSource) {
            setItemSource(source.toString());
        }
    }, [router.query]);

    // On query change, trigger a API fetch if needed
    useEffect(() => {
        if (!apiResults || apiResults.error) {
            dispatch(fetchItems(itemType, itemSource));
        }
    }, [itemType, itemSource]);

    // On item type change, fetch the new user progress
    useEffect(() => {
        // Retrieve the user progress through the API, only if necessary
        if (!progressResults || progressResults.error) {
            dispatch(fetchApi(progressApiLabel, "/api/progress", "GET", getApiKey(), {
                type: itemType
            }));
        }
    }, [itemType]);

    // When the user progress is retrieved, toggle off the main progress bar
    useEffect(() => {
        // Check if progress is successfully retrieved
        if (progressResults && progressResults.data && !progressResults.error && isLoading) {
            setLoading(false);
        }
    }, [progressResults]);

    // On new data available, start to show the items
    useEffect(() => {
        if (apiResults && !apiResults.error && !apiResults.fetching && !showItems) {
            setShowItems(true);
        }
    }, [apiResults]);

    // Shallow change the url of the page. This changes the query parameter and trigger a new page rendering
    const changeUrl = (newType: string, newSource: string, immediate?: boolean) => {
        if (immediate) {
            router.push("/items/[item_type]/[source]", "/items/" + newType + "/" + newSource, {
                shallow: true
            });
        } else {
            // Schedule the url change to the next render, just after the displayed data are removed.
            // This avoids an useless re-render of the old items when the items type or source change
            setShowItems(false);
            setNeedNewUrl({
                type: newType,
                source: newSource
            });
        }
    };

    // Change the "type" part of the url on tab change
    const handleTypeChange = (newItemType: string) => {
        if (newItemType != itemType) {
            changeUrl(newItemType, itemSource);
        }
    };
    const handleTypeChangeCallback = useCallback(handleTypeChange, [itemType, itemSource]);

    // Change the "source" part of the url
    const handleSourceChange = (newSource: string) => {
        if (newSource != itemSource) {
            changeUrl(itemType, newSource);
        }
    };
    const handleSourceChangeCallBack = useCallback(handleSourceChange, [itemType, itemSource]);

    // Redirect the user for bad queries
    if (!sourceExistsForItemType(itemSource, itemType)) {
        if (!itemTypeExists(itemType)) {
            return <Error statusCode={NOT_FOUND}/>;
        }

        // Default to wanikani
        changeUrl(itemType, "wanikani", true);
    }

    if (apiResults && apiResults.error) {
        return <Error statusCode={apiResults ? apiResults.data : INTERNAL_SERVER_ERROR}/>;
    }

    return (
        <PageContent pageTitle="Items" className={classes.root} showProgress={isLoading}>
            <TypeSelector onTypeChange={handleTypeChangeCallback} value={itemType}/>
            <SourceSelector itemType={itemType} onSourceChange={handleSourceChangeCallBack} value={itemSource}/>

            {apiResults && apiResults.fetching && (
                <CircularProgress className={classes.fetching} disableShrink/>
            )}

            <CategoryList
                categories={showItems && apiResults && !apiResults.error && !apiResults.fetching ? apiResults.data : undefined}
                progress={progressResults && !progressResults.error && !progressResults.fetching ? progressResults.data : undefined}
                initialDataLength={props.initialDataLength}/>
        </PageContent>
    );
}

// Server-side rendering
ItemPage.getInitialProps = async (ctx: ReduxNextPageContext): Promise<ItemPageProps> => {
    const {item_type, source} = ctx.query;

    if (!sourceExistsForItemType(source.toString(), item_type.toString())) {
        if (!itemTypeExists(item_type.toString())) {
            // The component will return a 404
            return {initialDataLength: 0};
        }

        // Default to wanikani
        redirect("/items/" + item_type.toString() + "/wanikani", ctx.req, ctx.res);
        return {initialDataLength: 0};
    }

    // Check if logged
    if (!hasApiKey(ctx.req)) {
        redirect("/login", ctx.req, ctx.res, false, true);
        return {initialDataLength: 0};
    }

    // Wait for the API call to finished.
    if (!process.browser) {
        await ctx.store.dispatch(fetchItems(item_type.toString(), source.toString(), ctx.req, ctx.res));
        const res = ctx.store.getState().api.results[labelFromItemTypeAndSource(item_type.toString(), source.toString())];
        return {
            initialDataLength: res && !res.error && !res.fetching ? res.data.length : 0
        }
    } else {
        ctx.store.dispatch(fetchItems(item_type.toString(), source.toString()));
    }

    return {initialDataLength: 0}
};

export default ItemPage;
