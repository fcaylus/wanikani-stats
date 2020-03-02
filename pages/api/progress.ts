import {NextApiRequest, NextApiResponse} from "next";
import parseApiRequest from "../../src/server/parseApiRequest";
import {INTERNAL_SERVER_ERROR, OK} from "http-status-codes";
import {getProgress} from "../../src/server/progress";
import {itemTypes} from "../../src/data/data";

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
        if (itemTypes().includes(queryType)) {
            type = queryType;
        }
    }
    let pageAfterId = undefined;
    if (req.query && req.query["page_after_id"]) {
        pageAfterId = req.query["page_after_id"].toString();
    }

    const result = await getProgress(apiKey, type, pageAfterId, req);

    if (!result) {
        return res.status(INTERNAL_SERVER_ERROR).send("ERROR");
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(OK).json(result);
}
