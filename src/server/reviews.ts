import WaniKaniApi from "./WaniKaniApi";
import subjectNameForId from "../data/sources/wanikani/subjectNameForId";
import {IncomingMessage} from "http";
import {QueryParameter} from "./interfaces/query";
import {ReviewStatsHashMap, ReviewStatsPage} from "../data/interfaces/reviews";

/**
 * Return the review statistics of the user
 * @param token API user token
 * @param pageAfterId ID of the first progress to retrieve. Used for pagination
 * @param updatedAfter Optional updated_after query to send to WK
 * @param req The request object of the connection. Used to get the current url.
 */
export const getReviewsStats = async (token: string,
                                      pageAfterId?: QueryParameter,
                                      updatedAfter?: QueryParameter,
                                      req?: IncomingMessage): Promise<ReviewStatsPage | null> => {
    const pageAfterIdParam = pageAfterId ? pageAfterId.toString() : undefined;
    const updatedAfterParam = updatedAfter ? updatedAfter.toString() : undefined;

    // See: https://docs.api.wanikani.com/#get-all-review-statistics for endpoint documentation
    let wkResult = await WaniKaniApi(token).getPaginated("review_statistics", {
        updated_after: updatedAfterParam
    }, pageAfterIdParam, req);

    if (wkResult.error || !wkResult.data) {
        return null;
    }

    // Convert WK API result to reviews hash map
    const parseData = (data: any): ReviewStatsHashMap => {
        // See https://docs.api.wanikani.com/#review-statistic-data-structure for data structure
        let reviews: ReviewStatsHashMap = {};

        for (const review of data) {
            const name = subjectNameForId(review.data.subject_id);
            reviews[name] = {
                type: review.data.subject_type,
                name: name,
                correct: {
                    reading: review.data.reading_correct ? review.data.reading_correct : 0,
                    meaning: review.data.meaning_correct ? review.data.meaning_correct : 0
                },
                incorrect: {
                    reading: review.data.reading_incorrect ? review.data.reading_incorrect : 0,
                    meaning: review.data.meaning_incorrect ? review.data.meaning_incorrect : 0
                }
            };
        }
        return reviews;
    };

    let page: ReviewStatsPage = wkResult.data;
    page.data = parseData(page.data);

    return page;
};
