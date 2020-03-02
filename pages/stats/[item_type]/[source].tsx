import React, {useEffect} from 'react';
import PageContent from "../../../src/app/components/PageContent";
import {useRouter} from "next/router";
import {INTERNAL_SERVER_ERROR, NOT_FOUND} from "http-status-codes";
import Error from 'next/error'
import {
    List,
    ListItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Theme,
    Typography
} from '@material-ui/core';
import {makeStyles} from "@material-ui/core/styles";
import {useDispatch, useSelector} from "react-redux";
import {fetchApi} from "../../../src/app/redux/api/actions";
import {RootState} from "../../../src/app/redux/store";
import {ApiResultState} from "../../../src/app/redux/api/types";
import {itemTypeExists, sourceExistsForItemType} from "../../../src/data/data";
import {getApiKey, hasApiKey} from "../../../src/app/apiKey";
import {IncomingMessage, ServerResponse} from "http";
import {Stats} from "../../../src/data/interfaces/stats";
import {ReduxNextPageContext} from "../../../src/app/redux/interfaces";
import redirect from "../../../src/redirect";
import {ItemCategory} from "../../../src/data/interfaces/item";
import ItemList from "../../../src/app/components/ItemList";
import {User} from "../../../src/data/interfaces/user";
import SourceSelector from "../../../src/app/components/SourceSelector";

// Create a label based on the specified query
const labelFromItemTypeAndSource = (itemType: string, source: string) => {
    return "stats/" + itemType + "/" + source;
};

// Wrapper around the fetchApi() redux action
const fetchStats = (itemType: string, source: string, req?: IncomingMessage, res?: ServerResponse) => {
    const label = labelFromItemTypeAndSource(itemType, source);
    const url = "/api/" + label;
    return fetchApi(label, url, "GET", getApiKey(req), undefined, undefined, undefined, req, res);
};

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "column"
    },
    table: {
        width: "fit-content",
        marginLeft: "auto",
        marginRight: "auto",
        overflowX: "auto",
        marginTop: theme.spacing(2)
    },
    cell: {
        padding: "2px 24px 2px 24px",
        [theme.breakpoints.down("md")]: {
            padding: "2px 14px 2px 14px",
        },
        [theme.breakpoints.down("sm")]: {
            padding: "2px 12px 2px 12px"
        },
        [theme.breakpoints.down("xs")]: {
            padding: "2px 2px 2px 2px"
        }
    },
    list: {
        display: "flex",
        flexDirection: "column",
    },
    listHeader: {
        marginTop: theme.spacing(2)
    },
    categoryItem: {
        flexDirection: "column",
        alignItems: "unset",
        position: "unset",
        padding: 0
    }
}));

function StatsPage() {
    const router = useRouter();
    const classes = useStyles();

    const {item_type, source} = router.query;

    /*
     * API stats results selector
     */
    const dispatch = useDispatch();
    const apiLabel = labelFromItemTypeAndSource(item_type.toString(), source.toString());
    const apiResults: ApiResultState = useSelector((state: RootState) => {
        return state.api.results[apiLabel];
    });
    const userResults: ApiResultState = useSelector((state: RootState) => {
        return state.api.results["user"];
    });

    useEffect(() => {
        if (!apiResults || apiResults.error) {
            dispatch(fetchStats(item_type.toString(), source.toString()));
        }
    }, [item_type, source]);

    // Shallow change the url of the page. This changes the query parameter and trigger a new page rendering
    const changeUrl = (newSource: string) => {
        router.push("/stats/[item_type]/[source]", "/stats/" + item_type.toString() + "/" + newSource, {
            shallow: true
        });
    };

    // Change the "source" part of the url
    const handleSourceChange = (newSource: string) => {
        if (newSource != source.toString()) {
            changeUrl(newSource);
        }
    };

    // Redirect the user for bad queries
    if (source.toString() === "wanikani" || !sourceExistsForItemType(source.toString(), item_type.toString())) {
        if (!itemTypeExists(item_type.toString())) {
            return <Error statusCode={NOT_FOUND}/>;
        }

        // Default to JLPT
        changeUrl("jlpt");
    }

    if (apiResults && apiResults.error) {
        return <Error statusCode={apiResults ? apiResults.data : INTERNAL_SERVER_ERROR}/>;
    }

    const formatPercentage = (levelIndex: number, categoryIndex: number): string => {
        const data = apiResults.data as Stats;
        const percentage = data.levels[levelIndex].categories[data.categories[categoryIndex]] * 100;

        if (levelIndex != 0) {
            // If the previous percentage is 100%, return "-"
            if (data.levels[levelIndex - 1].categories[data.categories[categoryIndex]] == 1) {
                return "-";
            }
        }

        return percentage.toFixed(1) + " %";
    };

    return (
        <PageContent pageTitle="Stats" className={classes.root} showProgress={!apiResults || apiResults.fetching}>
            <SourceSelector itemType={item_type.toString()} onSourceChange={handleSourceChange}
                            value={source.toString()} excludeList={["wanikani"]}/>

            {apiResults && !apiResults.error && !apiResults.fetching && (
                <Paper elevation={5} className={classes.table}>
                    <Table size="small" aria-label="stats table">
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.cell} align="center">Level</TableCell>
                                {(apiResults.data as Stats).displayedCategories.map((category) => (
                                    <TableCell key={category} className={classes.cell}
                                               align="center">{category}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(apiResults.data as Stats).levels.map((level, levelIndex) => {
                                const isSelected = userResults && !userResults.error && !userResults.fetching && (userResults.data as User).currentLevel == parseInt(level.level);
                                return (
                                    <TableRow key={level.level}
                                              selected={isSelected}
                                              hover={!isSelected}>
                                        <TableCell className={classes.cell} align="center"
                                                   variant="head" component="th">{level.level}</TableCell>
                                        {(apiResults.data as Stats).categories.map((category, categoryIndex) => (
                                            <TableCell
                                                key={category} className={classes.cell}
                                                align="center">{formatPercentage(levelIndex, categoryIndex)}</TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Paper>
            )}

            {apiResults && !apiResults.error && !apiResults.fetching && (
                <React.Fragment>
                    <Typography variant="h5" component="h2" className={classes.listHeader}>
                        Items not available in Wanikani
                    </Typography>
                    <List className={classes.list} disablePadding dense key={apiLabel}>
                        {(apiResults.data as Stats).otherItems.map((category: ItemCategory, index: number) => {
                            return (
                                <ListItem key={index} dense disableGutters className={classes.categoryItem}>
                                    <ItemList {...category} progress={undefined}/>
                                </ListItem>
                            );
                        })}
                    </List>
                </React.Fragment>
            )}
        </PageContent>
    );
}

// Server-side rendering
StatsPage.getInitialProps = async (ctx: ReduxNextPageContext) => {
    const {item_type, source} = ctx.query;

    if (source.toString() === "wanikani" || !sourceExistsForItemType(source.toString(), item_type.toString())) {
        if (!itemTypeExists(item_type.toString())) {
            // The component will return a 404
            return {};
        }

        // Default to jlpt
        redirect("/stats/" + item_type.toString() + "/jlpt", ctx.req, ctx.res);
        return {};
    }

    // Check if logged
    if (!hasApiKey(ctx.req)) {
        redirect("/login", ctx.req, ctx.res, false, true);
        return {};
    }

    // Wait for the API call to finished.
    if (!process.browser) {
        await ctx.store.dispatch(fetchStats(item_type.toString(), source.toString(), ctx.req, ctx.res));
    } else {
        ctx.store.dispatch(fetchStats(item_type.toString(), source.toString()));
    }

    return {}
};

export default StatsPage;
