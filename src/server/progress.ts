import {ProgressHashMap, ProgressHashMapPage, ProgressItemsCount} from "../data/interfaces/progress";
import WaniKaniApi from "./WaniKaniApi";
import subjectNameForId from "../data/sources/wanikani/subjectNameForId";
import absoluteUrl from "../absoluteUrl";
import {IncomingMessage} from "http";
import itemTypesJson from "../../src/data/item_types.json";


/**
 * Return the progress of the user, ie. the SRS level for each item
 * @param token API user token
 * @param type Type of the items to retrieve the progress for.
 * @param pageAfterId ID of the first progress to retrieve. Used for pagination
 * @param req The request object of the connection. Used to get the current url.
 * @param allPage If true, get all progress (get every pages). NOTE: Can be slow
 */
export const getProgress = async (token: string, type?: string, pageAfterId?: string, req?: IncomingMessage, allPage = false): Promise<ProgressHashMapPage | null> => {
    // See: https://docs.api.wanikani.com/#assignments for endpoint documentation
    const wkResult = await WaniKaniApi(token).get("assignments", {
        subject_types: type,
        page_after_id: pageAfterId
    });

    if (wkResult.error || !wkResult.data || !wkResult.data.data) {
        return null;
    }

    // Convert WK API result to progress hash map
    // See https://docs.api.wanikani.com/#assignments for data structure
    const data = wkResult.data.data;
    let progress: ProgressHashMap = {};

    for (const assignment of data) {
        progress[subjectNameForId(assignment.data.subject_id)] = assignment.data.srs_stage;
    }

    // Find the next page url (if needed) and add "page_after_id" query to the current url
    let hasNextPage = !!wkResult.data.pages.next_url;
    let nextPageUrl = undefined;
    let nextPageAfterId = undefined;
    if (hasNextPage) {
        nextPageAfterId = (new URL(wkResult.data.pages.next_url)).searchParams.get("page_after_id");
        nextPageAfterId = nextPageAfterId == null ? undefined : nextPageAfterId;

        if (!nextPageAfterId) {
            hasNextPage = false;
        } else if (req && req.url) {
            nextPageUrl = new URL(absoluteUrl(req) + req.url);
            nextPageUrl.searchParams.set("page_after_id", nextPageAfterId);
            nextPageUrl = nextPageUrl.href;
        }
    }

    let page: ProgressHashMapPage = {
        nextPageUrl: nextPageUrl,
        hasNextPage: hasNextPage,
        data: progress
    };

    if (allPage) {
        // Call recursively this function and merge element
        if (hasNextPage) {
            const nextPagesResult = await getProgress(token, type, nextPageAfterId, req, true);
            if (nextPagesResult) {
                page.data = {
                    ...page.data,
                    ...nextPagesResult.data
                }
            }
        }
        page.hasNextPage = false;
        page.nextPageUrl = undefined;
    }

    return page;
};

export const getItemsCount = async (token: string): Promise<ProgressItemsCount> => {
    let counts: ProgressItemsCount = {
        srs: {},
        type: {}
    };

    // First step is to retrieve the progress of all items of all pages
    // For each progress, the corresponding srs count is increased
    const types = Object.keys(itemTypesJson);

    for (const type of types) {
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
