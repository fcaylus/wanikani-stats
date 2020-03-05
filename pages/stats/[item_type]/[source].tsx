import React, {useEffect} from 'react';
import PageContent from "../../../src/app/components/page/PageContent";
import {useRouter} from "next/router";
import {INTERNAL_SERVER_ERROR, NOT_FOUND} from "http-status-codes";
import Error from 'next/error'
import {Paper, Table, TableBody, TableCell, TableHead, TableRow, Theme, Typography} from '@material-ui/core';
import {makeStyles} from "@material-ui/core/styles";
import {useDispatch} from "react-redux";
import {itemTypeExists, sourceExistsForItemType} from "../../../src/data/data";
import {hasApiKey} from "../../../src/app/apiKey";
import {Stats} from "../../../src/data/interfaces/stats";
import {ReduxNextPageContext} from "../../../src/app/redux/interfaces";
import redirect from "../../../src/redirect";
import {User} from "../../../src/data/interfaces/user";
import SourceSelector from "../../../src/app/components/SourceSelector";
import CategoryList from "../../../src/app/components/items/CategoryList";
import {
    isResultError,
    isResultFetching,
    isResultSuccessful,
    needResultFetching,
    useStatsSelector,
    useUserSelector
} from "../../../src/app/redux/api/selectors";
import {fetchStats} from "../../../src/app/redux/api/requests";

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
    listHeader: {
        marginTop: theme.spacing(2)
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
    const apiResult = useStatsSelector(item_type.toString(), source.toString());
    // The user endpoint dispatch is already called by PageHeader
    const userResult = useUserSelector();

    useEffect(() => {
        if (needResultFetching(apiResult)) {
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

    if (isResultError(apiResult)) {
        return <Error statusCode={apiResult ? apiResult.data : INTERNAL_SERVER_ERROR}/>;
    }

    const formatPercentage = (levelIndex: number, categoryIndex: number): string => {
        const data = apiResult.data as Stats;
        const percentage = data.levels[levelIndex].categories[data.categories[categoryIndex]] * 100;

        if (levelIndex != 0) {
            // If the previous percentage is 100%, return "-"
            if (data.levels[levelIndex - 1].categories[data.categories[categoryIndex]] == 1) {
                return "-";
            }
        }

        if (percentage < 0.05) {
            return "0 %";
        }

        return percentage.toFixed(1) + " %";
    };

    return (
        <PageContent pageTitle="Stats" className={classes.root} showProgress={isResultFetching(apiResult)}>
            <SourceSelector itemType={item_type.toString()} onSourceChange={handleSourceChange}
                            value={source.toString()} excludeList={["wanikani"]}/>

            {isResultSuccessful(apiResult) && (
                <Paper elevation={5} className={classes.table}>
                    <Table size="small" aria-label="stats table">
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.cell} align="center">Level</TableCell>
                                {(apiResult.data as Stats).displayedCategories.map((category) => (
                                    <TableCell key={category} className={classes.cell}
                                               align="center">{category}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(apiResult.data as Stats).levels.map((level, levelIndex) => {
                                const isSelected = isResultSuccessful(userResult) && (userResult.data as User).currentLevel == parseInt(level.level);
                                return (
                                    <TableRow key={level.level}
                                              selected={isSelected}
                                              hover={!isSelected}>
                                        <TableCell className={classes.cell} align="center"
                                                   variant="head" component="th">{level.level}</TableCell>
                                        {(apiResult.data as Stats).categories.map((category, categoryIndex) => (
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

            {isResultSuccessful(apiResult) && (
                <React.Fragment>
                    <Typography variant="h5" component="h2" className={classes.listHeader}>
                        Items not available in Wanikani
                    </Typography>
                    <CategoryList
                        categories={(apiResult.data as Stats).otherItems}
                        progress={undefined}/>
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
