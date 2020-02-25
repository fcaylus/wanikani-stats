import React from 'react';
import PageContent from "../../../src/app/components/PageContent";
import ItemList from "../../../src/app/components/ItemList";
import itemTypesJson from "../../../src/data/item_types.json";
import sourceTypesJson from "../../../src/data/source_types.json"
import {useRouter} from "next/router";
import {INTERNAL_SERVER_ERROR, NOT_FOUND} from "http-status-codes";
import Error from 'next/error'
import {
    CircularProgress,
    FormControl,
    FormControlLabel,
    FormLabel,
    List,
    ListItem,
    Paper,
    Radio,
    RadioGroup,
    Tab,
    Tabs,
    Theme
} from '@material-ui/core';
import {makeStyles} from "@material-ui/core/styles";
import {useDispatch, useSelector} from "react-redux";
import {fetchApi} from "../../../src/app/redux/api/actions";
import {RootState} from "../../../src/app/redux/store";
import {ApiResultState} from "../../../src/app/redux/api/types";
import {ReduxNextPageContext} from "../../../src/app/redux/interfaces";
import redirect from "../../../src/server/redirect";
import {ItemCategory} from "../../../src/data/interfaces/item";
import {itemTypeExists, sourceExistsForItemType} from "../../../src/data/data";
import {getApiKey, hasApiKey} from "../../../src/app/apiKey";
import {IncomingMessage} from "http";

const sourcesForType = (type: string) => {
    return Object(itemTypesJson)[type].sources;
};

// Create a label based on the specified query
const labelFromItemTypeAndSource = (itemType: string, source: string) => {
    return itemType + "/" + source;
};

// Wrapper around the fetchApi() redux action
const fetchItems = (itemType: string, source: string, req?: IncomingMessage) => {
    const label = labelFromItemTypeAndSource(itemType, source);
    const url = "/api/items/" + label;
    return fetchApi(label, url, "GET", getApiKey(req));
};

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "column"
    },
    tabsRoot: {
        width: "100%",
        marginBottom: theme.spacing(3)
    },
    fetching: {
        margin: theme.spacing(3),
        marginRight: "auto",
        marginLeft: "auto"
    },
    list: {
        display: "flex",
        flexDirection: "column"
    },
    sourcesRadioGroup: {
        flexDirection: "row"
    }
}));

/**
 * Render a page with the list of items and their progress.
 * All the data are retrieved from /api/items/* endpoints
 */
function ItemPage() {
    const router = useRouter();
    const classes = useStyles();

    let {item_type, source} = router.query;
    item_type = item_type.toString();
    source = source.toString();

    const dispatch = useDispatch();
    const apiLabel = labelFromItemTypeAndSource(item_type, source);
    const apiResults: ApiResultState = useSelector((state: RootState) => {
        return state.api.results[apiLabel];
    });

    // Shallow change the url of the page. This changes the query parameter and trigger a new page rendering
    const changeUrl = (newType: string, newSource: string) => {
        router.push("/items/[item_type]/[source]", "/items/" + newType + "/" + newSource, {
            shallow: true
        }).then(() => {
            dispatch(fetchItems(newType, newSource));
        })
    };

    // Change the the "type" part of the url on tab change
    const handleTabChange = (_event: React.ChangeEvent<{}>, newItemType: string) => {
        if (newItemType != item_type) {
            changeUrl(newItemType, source.toString());
        }
    };
    const handleSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSource = (event.target as HTMLInputElement).value;
        if (newSource != source) {
            changeUrl(item_type.toString(), newSource);
        }
    };

    if (!sourceExistsForItemType(source, item_type)) {
        if (!itemTypeExists(item_type)) {
            return <Error statusCode={NOT_FOUND}/>;
        }

        // Default to wanikani
        changeUrl(item_type, "wanikani");
    }

    if (apiResults && apiResults.error) {
        return <Error statusCode={apiResults ? apiResults.data : INTERNAL_SERVER_ERROR}/>;
    }

    return (
        <PageContent pageTitle="Items" className={classes.root}>
            <Paper className={classes.tabsRoot} elevation={5}>
                <Tabs
                    value={item_type}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    {Object.keys(itemTypesJson).map((type: string) => {
                        return <Tab key={type} label={Object(itemTypesJson)[type].display_name} value={type}/>
                    })}
                </Tabs>
            </Paper>

            <FormControl component="fieldset">
                <FormLabel component="legend">Displayed source</FormLabel>
                <RadioGroup aria-label="sources" name="sources" value={source} onChange={handleSourceChange}
                            className={classes.sourcesRadioGroup}>
                    {sourcesForType(item_type).map((availableSource: string) => {
                        return <FormControlLabel key={availableSource} value={availableSource} control={<Radio/>}
                                                 label={Object(sourceTypesJson)[availableSource].display_name}/>
                    })}
                </RadioGroup>
            </FormControl>

            {!apiResults || apiResults.fetching && (
                <CircularProgress className={classes.fetching} disableShrink/>
            )}

            {apiResults && !apiResults.fetching && (
                <List className={classes.list} disablePadding={true} dense={true} key={apiLabel}>
                    {apiResults.data.map((listProps: ItemCategory, index: number) => {
                        if (listProps.items.length == 0) {
                            return null;
                        }

                        return (
                            <ListItem dense={true} disableGutters={true} key={index}>
                                <ItemList {...listProps} />
                            </ListItem>
                        );
                    })}
                </List>
            )}
        </PageContent>
    );
}

// Server-side rendering
ItemPage.getInitialProps = async (ctx: ReduxNextPageContext) => {
    const {item_type, source} = ctx.query;

    if (!sourceExistsForItemType(source.toString(), item_type.toString())) {
        if (!itemTypeExists(item_type.toString())) {
            // The component will return a 404
            return {};
        }

        // Default to wanikani
        redirect("/items/" + item_type.toString() + "/wanikani", ctx.res);
        return {};
    }

    // Check if logged
    if (!hasApiKey(ctx.req)) {
        redirect("/login", ctx.res);
        return;
    }

    // Wait for the API call to finished. This is nearly non blocking on server-side since no data are retrieved from
    // external sources.
    if (!process.browser) {
        await ctx.store.dispatch(fetchItems(item_type.toString(), source.toString(), ctx.req));
    } else {
        ctx.store.dispatch(fetchItems(item_type.toString(), source.toString()));
    }

    return {}
};


export default ItemPage;
