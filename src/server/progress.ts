import {ProgressHashMap, ProgressHashMapPage} from "../data/interfaces/progress";
import WaniKaniApi from "./WaniKaniApi";
import subjectNameForId from "../data/sources/wanikani/subjectNameForId";
import {IncomingMessage} from "http";
import {Page} from "./interfaces/page";
import {itemTypeExists} from "../data/data";
import {QueryParameter} from "./interfaces/query";

/**
 * Return the progress of the user, ie. the SRS level for each item
 * @param token API user token
 * @param type Type of the items to retrieve the progress for.
 * @param pageAfterId ID of the first progress to retrieve. Used for pagination
 * @param updatedAfter Optional updated_after query to send to WK
 * @param req The request object of the connection. Used to get the current url.
 */
export const getProgress = async (token: string,
                                  type?: QueryParameter,
                                  pageAfterId?: QueryParameter,
                                  updatedAfter?: QueryParameter,
                                  req?: IncomingMessage): Promise<ProgressHashMapPage | null> => {
    const typeParam = type && itemTypeExists(type.toString().toLowerCase()) ? type.toString().toLowerCase() : undefined;
    const pageAfterIdParam = pageAfterId ? pageAfterId.toString() : undefined;
    const updatedAfterParam = updatedAfter ? updatedAfter.toString() : undefined;

    // See: https://docs.api.wanikani.com/#assignments for endpoint documentation
    let wkResult = await WaniKaniApi(token).getPaginated("assignments", {
        subject_types: typeParam,
        hidden: false,
        updated_after: updatedAfterParam
    }, pageAfterIdParam, req);

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

    let page: Page = wkResult.data;
    page.data = parseData(page.data);

    return page;
};
