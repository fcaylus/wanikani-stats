import React, {useEffect, useState} from "react";
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
import {
    isResultFetching,
    isResultSuccessful,
    needResultFetching,
    useLevelsSelector,
    useProgressSelector,
    useReviewsStatsSelector,
    useUserSelector,
} from "../src/app/redux/api/selectors";
import {fetchLevels, fetchProgress, fetchReviewsStats} from "../src/app/redux/api/requests";
import {ProgressItemsCount} from "../src/data/interfaces/progress";
import {getItemsCount} from "../src/app/progress";
import {Accuracy} from "../src/data/interfaces/accuracy";
import {getAccuracy} from "../src/app/accuracy";
import {averageLevelDuration} from "../src/app/levels";
import dynamic from "next/dynamic";

// Lazy load complex components
const LevelsDurationChart = dynamic(() => import("../src/app/components/progress/LevelsDurationChart"));
const ProjectionCard = dynamic(() => import("../src/app/components/progress/ProjectionCard"));

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

    /**
     * Data directly fetched from the API
     */
    const dispatch = useDispatch();
    const store = useStore();
    const userResult = useUserSelector();
    const progressRadicalResult = useProgressSelector("radical");
    const progressKanjiResult = useProgressSelector("kanji");
    const progressVocabularyResult = useProgressSelector("vocabulary");
    const reviewsStatsResult = useReviewsStatsSelector();
    const levelsResult = useLevelsSelector();

    /**
     * Computed values. They are stored at the page level to avoid recalculation at component level
     */
    const [itemsCount, setItemsCount] = useState<ProgressItemsCount | undefined>(undefined);
    const [accuracy, setAccuracy] = useState<Accuracy | undefined>(undefined);
    const [averageLevelTime, setAverageLevelTime] = useState<number | undefined>(undefined);

    /**
     * Fetch data from the API if needed
     */
    useEffect(() => {
        if (needResultFetching(levelsResult)) {
            dispatch(fetchLevels());
        }
        if (needResultFetching(reviewsStatsResult)) {
            dispatch(fetchReviewsStats());
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
    }, []);

    /**
     * Compute the rest of the data when fetching is done
     */
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

    useEffect(() => {
        if (isResultSuccessful(levelsResult)) {
            setAverageLevelTime(averageLevelDuration(Object.values(levelsResult.data)));
        }
    }, [levelsResult]);

    return (
        <PageContent className={classes.root}
                     showProgress={
                         isResultFetching(userResult)
                         || isResultFetching(progressRadicalResult)
                         || isResultFetching(progressKanjiResult)
                         || isResultFetching(progressVocabularyResult)
                         || isResultFetching(reviewsStatsResult)
                         || isResultFetching(levelsResult)}>
            <ItemsCountGrid itemsCount={itemsCount}/>

            <Grid container spacing={2} className={classes.grid}>
                <Grid item xs>
                    <StatusCard
                        user={isResultSuccessful(userResult) ? userResult.data : undefined}
                        itemsCount={itemsCount}
                        levels={isResultSuccessful(levelsResult) ? levelsResult.data : undefined}
                        averageTime={averageLevelTime}/>
                </Grid>
                {accuracy && (
                    <Grid item xs>
                        <AccuracyCard accuracy={accuracy}/>
                    </Grid>
                )}
            </Grid>
            <Grid container spacing={2} className={classes.grid}>
                <Grid item xs>
                    <ProjectionCard
                        user={isResultSuccessful(userResult) ? userResult.data : undefined}
                        levels={isResultSuccessful(levelsResult) ? levelsResult.data : undefined}
                        averageTime={averageLevelTime}/>
                </Grid>
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

    return {}
};

