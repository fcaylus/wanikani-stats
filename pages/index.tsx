import React, {useEffect, useState} from 'react';
import PageContent from "../src/app/components/page/PageContent";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {useDispatch, useStore} from "react-redux";
import {hasApiKey} from "../src/app/apiKey";
import StatusCard from "../src/app/components/progress/StatusCard";
import {ReduxNextPageContext} from "../src/app/redux/interfaces";
import redirect from "../src/redirect";
import ItemsCountGrid from "../src/app/components/progress/ItemsCountGrid";
import AccuracyCard from "../src/app/components/progress/AccuracyCard";
import {Grid} from "@material-ui/core";
import LevelsDurationChart from "../src/app/components/progress/LevelsDurationChart";
import {
    isResultFetching,
    isResultSuccessful,
    needResultFetching,
    useLevelsSelector,
    useProgressSelector,
    useReviewsStatsSelector,
    useStatusSelector
} from "../src/app/redux/api/selectors";
import {fetchLevels, fetchProgress, fetchReviewsStats, fetchStatus} from "../src/app/redux/api/requests";
import {ProgressItemsCount} from "../src/data/interfaces/progress";
import {getItemsCount} from "../src/app/progress";
import {Accuracy} from "../src/data/interfaces/accuracy";
import {getAccuracy} from "../src/app/accuracy";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        "& > *:not(:last-child)": {
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


/**
 * Home page of the app.
 * Simply dispatch all the API request and render a grid of sub components using these API data.
 */
export default function IndexPage() {
    const classes = useStyles();

    const dispatch = useDispatch();
    const store = useStore();
    const statusResult = useStatusSelector();
    const progressRadicalResult = useProgressSelector("radical");
    const progressKanjiResult = useProgressSelector("kanji");
    const progressVocabularyResult = useProgressSelector("vocabulary");
    const reviewsStatsResult = useReviewsStatsSelector();
    const levelsResult = useLevelsSelector();

    const [itemsCount, setItemsCount] = useState<ProgressItemsCount | undefined>(undefined);
    const [accuracy, setAccuracy] = useState<Accuracy | undefined>(undefined);

    useEffect(() => {
        if (needResultFetching(statusResult)) {
            dispatch(fetchStatus());
        }
        if (needResultFetching(progressRadicalResult)) {
            dispatch(fetchProgress("radical"))
        }
        if (needResultFetching(progressKanjiResult)) {
            dispatch(fetchProgress("kanji"))
        }
        if (needResultFetching(progressVocabularyResult)) {
            dispatch(fetchProgress("vocabulary"))
        }
        if (needResultFetching(reviewsStatsResult)) {
            dispatch(fetchReviewsStats());
        }
        if (needResultFetching(levelsResult)) {
            dispatch(fetchLevels());
        }
    }, []);

    useEffect(() => {
        if (isResultSuccessful(progressRadicalResult)
            && isResultSuccessful(progressKanjiResult)
            && isResultSuccessful(progressVocabularyResult)) {
            setItemsCount(getItemsCount(store.getState()));
        }
    }, [progressKanjiResult, progressVocabularyResult, progressRadicalResult]);

    useEffect(() => {
        if (isResultSuccessful(reviewsStatsResult)) {
            setAccuracy(getAccuracy(store.getState()));
        }
    }, [reviewsStatsResult]);

    return (
        <PageContent className={classes.root}
                     showProgress={
                         isResultFetching(statusResult)
                         || isResultFetching(progressRadicalResult)
                         || isResultFetching(progressKanjiResult)
                         || isResultFetching(progressVocabularyResult)
                         || isResultFetching(reviewsStatsResult)
                         || isResultFetching(levelsResult)}>
            <ItemsCountGrid itemsCount={itemsCount}/>

            <Grid container spacing={2} className={classes.grid}>
                <Grid item xs>
                    <StatusCard
                        status={isResultSuccessful(statusResult) ? statusResult.data : undefined}
                        itemsCount={itemsCount}
                        levelsProgression={isResultSuccessful(levelsResult) ? levelsResult.data : undefined}/>
                </Grid>
                {isResultSuccessful(reviewsStatsResult) && (
                    <Grid item xs>
                        <AccuracyCard accuracy={accuracy}/>
                    </Grid>
                )}
            </Grid>
            <Grid container spacing={2} className={classes.grid}>
                <Grid item xs>
                    <LevelsDurationChart levels={isResultSuccessful(levelsResult) ? levelsResult.data : undefined}/>
                </Grid>
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

