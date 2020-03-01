import {NextApiRequest, NextApiResponse} from "next";
import WaniKaniApi from "../../src/server/WaniKaniApi";
import parseApiRequest from "../../src/server/parseApiRequest";
import {OK} from "http-status-codes";
import {ProgressEndpointResult, ProgressHashMap} from "../../src/server/interfaces/progress";
import subjectNameForId from "../../src/data/sources/wanikani/subjectNameForId";
import absoluteUrl from "../../src/absoluteUrl";

/**
 * Fetch user progress, depending on the query parameter:
 * - type: type of item (radical, kanji, vocabulary)
 * - page_after_id: used for pagination. See https://docs.api.wanikani.com/#pagination
 * Returns a hash map (JSON object) of "subject name" -> "SRS level".
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const requestParsedResult = await parseApiRequest(req, "GET");
    if (requestParsedResult.error) {
        return res.status(requestParsedResult.errorCode).send(requestParsedResult.errorCode.toString());
    }
    const apiKey = requestParsedResult.apiKey;

    // Find the query parameters
    let type = undefined;
    if (req.query && req.query.type) {
        const queryType = req.query.type.toString().toLowerCase();
        if (["kanji", "radical", "vocabulary"].includes(queryType)) {
            type = queryType;
        }
    }
    let pageAfterId = undefined;
    if (req.query && req.query["page_after_id"]) {
        pageAfterId = req.query["page_after_id"].toString();
    }

    // See: https://docs.api.wanikani.com/#assignments for endpoint documentation
    const wkResult = await WaniKaniApi(apiKey).get("assignments", {
        subject_types: type,
        ["page_after_id"]: pageAfterId
    });

    if (wkResult.error || !wkResult.data || !wkResult.data.data) {
        return res.status(wkResult.errorCode).send("ERROR");
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
    if (hasNextPage && req.url) {
        const nextPageAfterId = (new URL(wkResult.data.pages.next_url)).searchParams.get("page_after_id");
        if (nextPageAfterId) {
            nextPageUrl = new URL(absoluteUrl(req) + req.url);
            nextPageUrl.searchParams.set("page_after_id", nextPageAfterId);
            nextPageUrl = nextPageUrl.href;
        } else {
            hasNextPage = false;
        }
    }

    const result: ProgressEndpointResult = {
        nextPageUrl: nextPageUrl,
        hasNextPage: hasNextPage,
        data: progress
    };

    res.setHeader("Content-Type", "application/json");
    return res.status(OK).json(result);
}
