import {Accuracy} from "../data/interfaces/accuracy";
import {itemTypes} from "../data/data";
import {isResultSuccessful, reviewsStatsSelector} from "./redux/api/selectors";
import {ReviewStat} from "../data/interfaces/reviews";
import {RootState} from "./redux/reducer";

/**
 * Compute the accuracy based on the state. /api/reviews/stats endpoint is required to compute the accuracy.
 */
export const getAccuracy = (state: RootState): Accuracy => {
    let accuracy: Accuracy = {};

    // Init accuracy object
    for (const itemType of itemTypes()) {
        accuracy[itemType] = {
            correct: {
                meaning: 0,
                reading: 0
            },
            incorrect: {
                meaning: 0,
                reading: 0
            },
            total: {
                meaning: 0,
                reading: 0
            }
        }
    }

    const reviewsStats = reviewsStatsSelector(state);
    if (isResultSuccessful(reviewsStats)) {
        for (const stat of (reviewsStats.data as ReviewStat[])) {
            accuracy[stat.type].correct.meaning += stat.correct.meaning;
            accuracy[stat.type].correct.reading += stat.correct.reading;
            accuracy[stat.type].incorrect.meaning += stat.incorrect.meaning;
            accuracy[stat.type].incorrect.reading += stat.incorrect.reading;
            accuracy[stat.type].total.meaning += stat.correct.meaning + stat.incorrect.meaning;
            accuracy[stat.type].total.reading += stat.correct.reading + stat.incorrect.reading;
        }
    }

    return accuracy;
};
