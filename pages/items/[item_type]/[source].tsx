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
import {useDispatch, useSelector} from "react-redux";
import {fetchApi} from "../../../src/app/redux/api/actions";
import {RootState} from "../../../src/app/redux/store";
import {ApiResultState} from "../../../src/app/redux/api/types";
import {ReduxNextPageContext} from "../../../src/app/redux/interfaces";
import redirect from "../../../src/redirect";
import {ItemCategory} from "../../../src/data/interfaces/item";
import {itemTypeExists, sourceExistsForItemType} from "../../../src/data/data";
import {getApiKey, hasApiKey} from "../../../src/app/apiKey";
import {IncomingMessage, ServerResponse} from "http";
import {ProgressHashMap} from "../../../src/server/interfaces/progress";

const sourcesForType = (type: string) => {
    return Object(itemTypesJson)[type].sources;
};

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

interface CategoryListItemProps {
    categoryProps: ItemCategory,
    progress?: ProgressHashMap
}

const CategoryListItem = React.memo((props: CategoryListItemProps) => {
    const classes = useStyles();
    return (
        <ListItem dense disableGutters className={classes.categoryItem}>
            <ItemList {...props.categoryProps} progress={props.progress}/>
        </ListItem>
    );
});

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

    const {item_type, source} = router.query;

    /*
     * API items results state and selector
     */
    const dispatch = useDispatch();
    const apiLabel = labelFromItemTypeAndSource(item_type.toString(), source.toString());
    const apiResults: ApiResultState = useSelector((state: RootState) => {
        return state.api.results[apiLabel];
    });
    // displayedDataLength increase progressively to improve the "Time to Content" of the page
    const [displayedDataLength, setDisplayedDataLength] = useState(props.initialDataLength);
    const [isLoading, setLoading] = useState(true);

    /*
     * API user progress results state and selector
     */
    const progressApiLabel = "progress/" + item_type.toString();
    const progressResults: ApiResultState = useSelector((state: RootState) => {
        return state.api.results[progressApiLabel];
    });

    // Use to schedule the change of url AFTER the last renders that removes every items from the list
    const [needNewUrl, setNeedNewUrl] = useState<any>(undefined);

    useEffect(() => {
        if (needNewUrl) {
            needNewUrl();
        }
    }, [needNewUrl]);

    useEffect(() => {
        if (!apiResults || apiResults.error) {
            dispatch(fetchItems(item_type.toString(), source.toString()));
        }
    }, [item_type, source]);

    // On item type change, fetch the new user progress
    useEffect(() => {
        // Retrieve the user progress through the API, only if necessary
        if (!progressResults || progressResults.error) {
            dispatch(fetchApi(progressApiLabel, "/api/progress", "GET", getApiKey(), {
                type: item_type.toString()
            }));
        }
    }, [item_type]);

    useEffect(() => {
        // Check if progress is successfully retrieved
        if (progressResults && progressResults.data && !progressResults.error && isLoading) {
            setLoading(false);
        }
    }, [progressResults]);

    /**
     * Display item list one category at a time. This avoid one big refresh of the page, and allow a better
     * "Time to content" time of the page since the item list can be huge.
     * When a category is added, displayedDataLength state is modified, which trigger an effect calling this method again.
     */
    const displayItemListProgressively = () => {
        // Inspired by: https://itnext.io/handling-large-lists-and-tables-in-react-238397854625
        // setTimeout put the function at the end of the calling stack
        setTimeout(() => {
            if (apiResults && !apiResults.fetching && !apiResults.error) {
                const apiLength = (apiResults.data as ItemCategory[]).length;

                if (displayedDataLength < apiLength) {
                    // Load data by chunk of 1 category
                    const newLength = Math.min(apiLength, displayedDataLength + 1);
                    setDisplayedDataLength(newLength);
                }
            }
        }, 0);
    };

    useEffect(() => {
        if (apiResults && !apiResults.fetching && !apiResults.error) {
            displayItemListProgressively();
        }
    }, [apiResults, displayedDataLength]);

    // Shallow change the url of the page. This changes the query parameter and trigger a new page rendering
    const changeUrl = (newType: string, newSource: string, immediate?: boolean) => {
        const changeUrlFunc = () => {
            router.push("/items/[item_type]/[source]", "/items/" + newType + "/" + newSource, {
                shallow: true
            });
        };
        if (immediate) {
            changeUrlFunc();
        } else {
            // Schedule the url change to the next url, just after the displayed data are removed.
            // This avoids an useless re-render of the old items when the item_type change
            setDisplayedDataLength(0);
            setNeedNewUrl(changeUrlFunc);
        }
    };

    // Change the "type" part of the url on tab change
    const handleTabChange = (_event: React.ChangeEvent<{}>, newItemType: string) => {
        if (newItemType != item_type.toString()) {
            changeUrl(newItemType, source.toString());
        }
    };
    // Change the "source" part of the url
    const handleSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSource = (event.target as HTMLInputElement).value;
        if (newSource != source.toString()) {
            changeUrl(item_type.toString(), newSource);
        }
    };

    // Redirect the user for bad queries
    if (!sourceExistsForItemType(source.toString(), item_type.toString())) {
        if (!itemTypeExists(item_type.toString())) {
            return <Error statusCode={NOT_FOUND}/>;
        }

        // Default to wanikani
        changeUrl(item_type.toString(), "wanikani", true);
    }

    if (apiResults && apiResults.error) {
        return <Error statusCode={apiResults ? apiResults.data : INTERNAL_SERVER_ERROR}/>;
    }

    const categoryComponent = (categoryProps: ItemCategory, index: number) => {
        if (index >= displayedDataLength || categoryProps.items.length == 0) {
            return null;
        }

        return (
            <CategoryListItem key={index} categoryProps={categoryProps}
                              progress={progressResults && !progressResults.error ? progressResults.data : undefined}/>
        );
    };

    return (
        <PageContent pageTitle="Items" className={classes.root} showProgress={isLoading}>
            <Paper className={classes.tabsRoot} elevation={5}>
                <Tabs
                    value={item_type.toString()}
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
                <RadioGroup aria-label="sources" name="sources" value={source.toString()} onChange={handleSourceChange}
                            className={classes.sourcesRadioGroup}>
                    {sourcesForType(item_type.toString()).map((availableSource: string) => {
                        return <FormControlLabel key={availableSource} value={availableSource}
                                                 control={<Radio disableRipple disableTouchRipple/>}
                                                 label={Object(sourceTypesJson)[availableSource].display_name}/>
                    })}
                </RadioGroup>
            </FormControl>

            {apiResults && apiResults.fetching && (
                <CircularProgress className={classes.fetching} disableShrink/>
            )}

            <List className={classes.list} disablePadding dense key={apiLabel}>
                {apiResults && apiResults.data && !apiResults.error && !apiResults.fetching && (
                    apiResults.data.map((data: ItemCategory, index: number) => {
                        return categoryComponent(data, index)
                    })
                )}
            </List>
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
