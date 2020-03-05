import {Page} from "../../server/interfaces/page";

/**
 * Review Statistics for a specified item
 */
export interface ReviewStat {
    // Item type. ie: "radical", "kanji", "vocabulary"
    type: string;
    // WK name
    name: string;
    correct: {
        meaning: number;
        reading: number;
    },
    incorrect: {
        meaning: number;
        reading: number;
    }
}

/**
 * Page returned by /api/review/stats endpoint
 */
export interface ReviewStatsPage extends Page {
    data: ReviewStat[]
}
