import React, {useEffect} from 'react';
import PageContent from "../../src/app/components/page/PageContent";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {useDispatch} from "react-redux";
import {hasApiKey} from "../../src/app/apiKey";
import {ReduxNextPageContext} from "../../src/app/redux/interfaces";
import redirect from "../../src/redirect";
import {
    isResultFetching,
    isResultSuccessful,
    needResultFetching,
    useItemsSelector
} from "../../src/app/redux/api/selectors";
import {fetchItems} from "../../src/app/redux/api/requests";
import ItemsCategoryGrid from "../../src/app/components/generalstats/ItemsCategoryGrid";
import {Grid} from "@material-ui/core";
import ItemsPerLevelChart from "../../src/app/components/generalstats/ItemsPerLevelChart";
import ReviewsPerLevelChart from "../../src/app/components/generalstats/ReviewsPerLevelChart";

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
 * Page displaying general statistics about WaniKani (doesn't depend on the user progression)
 */
export default function StatsGeneralPage() {
    const classes = useStyles();

    const dispatch = useDispatch();
    const itemsRadicalResult = useItemsSelector("radical", "wanikani");
    const itemsKanjiResult = useItemsSelector("kanji", "wanikani");
    const itemsVocabularyResult = useItemsSelector("vocabulary", "wanikani");

    useEffect(() => {

        if (needResultFetching(itemsRadicalResult)) {
            dispatch(fetchItems("radical", "wanikani"));
        }
        if (needResultFetching(itemsKanjiResult)) {
            dispatch(fetchItems("kanji", "wanikani"));
        }
        if (needResultFetching(itemsVocabularyResult)) {
            dispatch(fetchItems("vocabulary", "wanikani"));
        }
    }, []);

    return (
        <PageContent className={classes.root}
                     showProgress={
                         isResultFetching(itemsRadicalResult)
                         || isResultFetching(itemsKanjiResult)
                         || isResultFetching(itemsVocabularyResult)}>
            {isResultSuccessful(itemsRadicalResult) && isResultSuccessful(itemsKanjiResult) && isResultSuccessful(itemsVocabularyResult) && (
                <ItemsCategoryGrid radicals={itemsRadicalResult.data}
                                   kanjis={itemsKanjiResult.data}
                                   vocabularies={itemsVocabularyResult.data}/>
            )}

            <Grid container spacing={2} className={classes.grid}>
                {isResultSuccessful(itemsRadicalResult) && isResultSuccessful(itemsKanjiResult) && isResultSuccessful(itemsVocabularyResult) && (
                    <Grid item xs>
                        <ItemsPerLevelChart radicals={itemsRadicalResult.data}
                                            kanjis={itemsKanjiResult.data}
                                            vocabularies={itemsVocabularyResult.data}/>
                    </Grid>
                )}
            </Grid>
            <Grid container spacing={2} className={classes.grid}>
                {isResultSuccessful(itemsRadicalResult) && isResultSuccessful(itemsKanjiResult) && isResultSuccessful(itemsVocabularyResult) && (
                    <Grid item xs>
                        <ReviewsPerLevelChart radicals={itemsRadicalResult.data}
                                              kanjis={itemsKanjiResult.data}
                                              vocabularies={itemsVocabularyResult.data}/>
                    </Grid>
                )}
            </Grid>
        </PageContent>
    );
}

// Server-side rendering
StatsGeneralPage.getInitialProps = async (ctx: ReduxNextPageContext) => {
    // Check if logged
    if (!hasApiKey(ctx.req)) {
        redirect("/login", ctx.req, ctx.res, false, true);
        return {};
    }

    return {}
};

