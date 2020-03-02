import {ProgressHashMap, ProgressHashMapPage, ProgressItemsCount} from "../data/interfaces/progress";
import WaniKaniApi from "./WaniKaniApi";
import subjectNameForId from "../data/sources/wanikani/subjectNameForId";
import {IncomingMessage} from "http";
import {Page} from "./interfaces/page";
import {itemTypes} from "../data/data";


/**
 * Return the progress of the user, ie. the SRS level for each item
 * @param token API user token
 * @param type Type of the items to retrieve the progress for.
 * @param pageAfterId ID of the first progress to retrieve. Used for pagination
 * @param req The request object of the connection. Used to get the current url.
 * @param allPage If true, get all progress (get every pages). NOTE: Can be slow
 */
export const getProgress = async (token: string, type?: string, pageAfterId?: string, req?: IncomingMessage, allPage?: boolean): Promise<ProgressHashMapPage | null> => {
    // See: https://docs.api.wanikani.com/#assignments for endpoint documentation
    let wkResult = await WaniKaniApi(token).getPaginated("assignments", {
        subject_types: type,
        hidden: false
    }, pageAfterId, req, allPage);

    if (wkResult.error || !wkResult.data) {
        return null;
    }

    // Convert WK API result to progress hash map
    const parseData = (data: any): ProgressHashMap => {
        // See https://docs.api.wanikani.com/#assignments for data structure
        let progress: ProgressHashMap = {};

        for (const assignment of data) {
            progress[subjectNameForId(assignment.data.subject_id)] = assignment.data.srs_stage;
        }
        return progress;
    };

    if (!allPage) {
        let page: Page = wkResult.data;
        page.data = parseData(page.data);

        return page;
    } else {
        let pageResult: ProgressHashMapPage = {
            hasNextPage: false,
            nextPageUrl: undefined,
            data: {}
        };

        // Merge all pages
        for (const page of wkResult.data) {
            pageResult.data = {...pageResult.data, ...parseData(page.data)}
        }

        return pageResult;
    }
};

/**
 * Count every items and group them by srs and type
 * @param token
 */
export const getItemsCount = async (token: string): Promise<ProgressItemsCount> => {
    let counts: ProgressItemsCount = {
        srs: {},
        type: {}
    };

    // First step is to retrieve the progress of all items of all pages
    // For each progress, the corresponding srs count is increased
    for (const type of itemTypes()) {
        const typeProgress = await getProgress(token, type, undefined, undefined, true);
        if (typeProgress) {
            counts.type[type] = Object.keys(typeProgress.data).length;
            const srsList = Object.values(typeProgress.data);

            for (const srs of srsList) {
                counts.srs[srs] = (counts.srs[srs] ? counts.srs[srs] : 0) + 1;
            }
        }
    }

    return counts;
};
