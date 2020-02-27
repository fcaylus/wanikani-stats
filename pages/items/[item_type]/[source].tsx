import React, {useEffect, useState} from 'react';
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
import {useDispatch, useSelector, useStore} from "react-redux";
import {fetchApi} from "../../../src/app/redux/api/actions";
import {RootState} from "../../../src/app/redux/store";
import {ApiResultState} from "../../../src/app/redux/api/types";
import {ReduxNextPageContext} from "../../../src/app/redux/interfaces";
import redirect from "../../../src/server/redirect";
import {ItemCategory} from "../../../src/data/interfaces/item";
import {itemTypeExists, sourceExistsForItemType} from "../../../src/data/data";
import {getApiKey, hasApiKey} from "../../../src/app/apiKey";
import {IncomingMessage} from "http";
import {ProgressHashMap} from "../../../src/server/interfaces/progress";

interface DisplayedData {
    label: string;
    index: number;
}

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
    },
    categoryItem: {
        flexDirection: "column",
        alignItems: "unset",
        position: "unset",
        padding: 0
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

    /*
     * API items results state and selector
     */
    const dispatch = useDispatch();
    const store = useStore();
    const apiLabel = labelFromItemTypeAndSource(item_type, source);
    const apiResults: ApiResultState = useSelector((state: RootState) => {
        return state.api.results[apiLabel];
    });
    // displayedData and displayedDataLength increase progressively progressively to improve the "Time to Content" of the page
    const [displayedData, setDisplayedData] = useState<DisplayedData[]>([]);
    const [displayedDataLength, setDisplayedDataLength] = useState(0);

    /*
     * API user progress results state and selector
     */
    const progressApiLabel = "progress/" + item_type;
    const progressResults: ApiResultState = useSelector((state: RootState) => {
        return state.api.results[progressApiLabel];
    });
    const [userProgress, setUserProgress] = useState<ProgressHashMap>();

    // On item type change, fetch the new user progress
    useEffect(() => {
        setUserProgress(undefined);
        // Retrieve the user progress through the API
        dispatch(fetchApi(progressApiLabel, "/api/progress", "GET", getApiKey(), {
            type: item_type.toString()
        }));
    }, [item_type]);

    useEffect(() => {
        // Check if progress is successfully retrieved
        if (progressResults && progressResults.data && progressResults.data != userProgress && !progressResults.error) {
            setUserProgress(progressResults.data);
        }
    }, [progressResults, userProgress]);

    /**
     * Display item list one category at a time. This avoid one big refresh of the page, and allow a better
     * "Time to content" time of the page since the item list can be huge.
     * When a category is added, displayedDataLength state is modified, which trigger an effect calling this method again.
     */
    const displayItemListProgressively = () => {
        // setTimeout(..., 0) put the function as the end of the calling stack which allows user interactions.
        // Inspired by: https://itnext.io/handling-large-lists-and-tables-in-react-238397854625
        setTimeout(() => {
            if (apiResults && !apiResults.fetching && !apiResults.error) {
                const apiLength = apiResults.data.length;

                if (displayedDataLength < apiLength) {
                    // Load data by chunk of 1 category
                    const newLength = Math.min(apiLength, displayedDataLength + 1);

                    if (displayedData.length >= newLength) {
                        // If data is already displayed, just change it with the new one
                        let newData = displayedData.slice(0, Math.min(apiLength, displayedData.length));
                        newData[newLength - 1] = {
                            label: apiLabel,
                            index: newLength - 1
                        };
                        setDisplayedData(newData);
                    } else {
                        // Add new data
                        setDisplayedData([...displayedData, {
                            label: apiLabel,
                            index: newLength - 1
                        }]);
                    }
                    setDisplayedDataLength(newLength);
                }
            }
        }, 0);
    };
    useEffect(() => {
        // Remove the displayed data on query params change
        setDisplayedDataLength(0);
    }, [item_type, source]);
    useEffect(() => {
        if (apiResults && !apiResults.fetching && !apiResults.error) {
            displayItemListProgressively();
        }
    }, [apiResults, displayedDataLength]);

    // Shallow change the url of the page. This changes the query parameter and trigger a new page rendering
    const changeUrl = (newType: string, newSource: string) => {
        router.push("/items/[item_type]/[source]", "/items/" + newType + "/" + newSource, {
            shallow: true
        }).then(() => {
            dispatch(fetchItems(newType, newSource));
        })
    };

    // Change the "type" part of the url on tab change
    const handleTabChange = (_event: React.ChangeEvent<{}>, newItemType: string) => {
        if (newItemType != item_type) {
            changeUrl(newItemType, source.toString());
        }
    };
    // Change the "source" part of the url
    const handleSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSource = (event.target as HTMLInputElement).value;
        if (newSource != source) {
            changeUrl(item_type.toString(), newSource);
        }
    };

    // Redirect the user for bad queries
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

    const categoryComponent = (categoryProps: ItemCategory, index: number) => {
        if (categoryProps.items.length == 0) {
            return null;
        }

        return (
            <ListItem dense disableGutters key={index} className={classes.categoryItem}>
                <ItemList {...categoryProps} progress={userProgress}/>
            </ListItem>
        );
    };

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
                        return <Tab key={type} label={Object(itemTypesJson)[type].display_name} value={type}
                                    disableRipple disableTouchRipple/>
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

            {apiResults && apiResults.fetching && (
                <CircularProgress className={classes.fetching} disableShrink/>
            )}

            <List className={classes.list} disablePadding dense key={apiLabel}>
                {displayedData.map((data: DisplayedData, index: number) => {
                    return categoryComponent(store.getState().api.results[data.label].data[data.index], index)
                })}
            </List>
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

    // Wait for the API call to finished.
    if (!process.browser) {
        await ctx.store.dispatch(fetchItems(item_type.toString(), source.toString(), ctx.req));
    } else {
        ctx.store.dispatch(fetchItems(item_type.toString(), source.toString()));
    }

    return {}
};

export default ItemPage;
