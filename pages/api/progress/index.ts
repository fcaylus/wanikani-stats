import {NextApiRequest, NextApiResponse} from "next";
import parseApiRequest from "../../../src/server/parseApiRequest";
import {INTERNAL_SERVER_ERROR, OK} from "http-status-codes";
import {getProgress} from "../../../src/server/progress";

/**
 * Fetch user progress, depending on the query parameter:
 * - type: type of item (radical, kanji, vocabulary)
 * - page_after_id: used for pagination. See https://docs.api.wanikani.com/#pagination
 * - updated_after: used for cache. See https://docs.api.wanikani.com/#leveraging-the-code-updated_after-code-filter
 * Returns a hash map (JSON object) of "subject name" -> "SRS level" (ProgressHashMap). This is a paginated result,
 * so the return types inherit Page
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const requestParsedResult = await parseApiRequest(req, "GET");
    if (requestParsedResult.error) {
        return res.status(requestParsedResult.errorCode).send(requestParsedResult.errorCode.toString());
    }

    const result = await getProgress(requestParsedResult.apiKey, req.query["type"], req.query["page_after_id"], req.query["updated_after"], req);

    if (!result) {
        return res.status(INTERNAL_SERVER_ERROR).send("ERROR");
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(OK).json(result);
}
