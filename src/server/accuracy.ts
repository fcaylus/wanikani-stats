import WaniKaniApi from "./WaniKaniApi";
import {Accuracy} from "../data/interfaces/accuracy";
import {itemTypes} from "../data/data";

/**
 * Get the accuracy of all reviews done by the user
 */
export const getAccuracy = async (token: string): Promise<Accuracy | null> => {
    // See: https://docs.api.wanikani.com/#get-all-review-statistics
    let wkResult = await WaniKaniApi(token).getPaginated("review_statistics", {
        hidden: false
    }, undefined, undefined, true);

    if (wkResult.error || !wkResult.data) {
        return null;
    }

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

    // For each review of each page, update the accuracy counts
    const parseData = (data: any) => {
        // See https://docs.api.wanikani.com/#review-statistic-data-structure for data structure

        for (const review of data) {
            const itemType = review.data.subject_type;
            accuracy[itemType].correct.reading += review.data.reading_correct;
            accuracy[itemType].correct.meaning += review.data.meaning_correct;
            accuracy[itemType].incorrect.reading += review.data.reading_incorrect;
            accuracy[itemType].incorrect.meaning += review.data.meaning_incorrect;
        }
    };

    // Parse all pages
    for (const page of wkResult.data) {
        parseData(page.data);
    }

    for (const itemType of itemTypes()) {
        accuracy[itemType].total.reading = accuracy[itemType].correct.reading + accuracy[itemType].incorrect.reading;
        accuracy[itemType].total.meaning = accuracy[itemType].correct.meaning + accuracy[itemType].incorrect.meaning;
    }

    return accuracy;
};
