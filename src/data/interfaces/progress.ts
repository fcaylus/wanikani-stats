import {Page} from "../../server/interfaces/page";

/**
 * Hash map of user progress
 */
export interface ProgressHashMap {
    [subjectName: string]: /* SRS level */ number;
}

/**
 * Page returned by /api/progress
 */
export interface ProgressHashMapPage extends Page {
    data: ProgressHashMap;
}

/**
 * Count the number of items unlocked for each SRS level and each type
 */
export interface ProgressItemsCount {
    srs: {
        [srs: number]: /* item count */ number;
    },
    type: {
        [itemType: string]: /* item count */ number;
    }
}
