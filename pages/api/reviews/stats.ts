import {NextApiRequest, NextApiResponse} from "next";
import parseApiRequest from "../../../src/server/parseApiRequest";
import {INTERNAL_SERVER_ERROR, OK} from "http-status-codes";
import {getReviewsStats} from "../../../src/server/reviews";

/**
 * Fetch user review statistics and return a paginated result.
 * Accepted query parameter:
 * - page_after_id: used for pagination. See https://docs.api.wanikani.com/#pagination
 * - updated_after: used for cache. See https://docs.api.wanikani.com/#leveraging-the-code-updated_after-code-filter
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const requestParsedResult = await parseApiRequest(req, "GET");
    if (requestParsedResult.error) {
        return res.status(requestParsedResult.errorCode).send(requestParsedResult.errorCode.toString());
    }

    const reviewStats = await getReviewsStats(requestParsedResult.apiKey, req.query["page_after_id"], req.query["updated_after"], req);

    if (!reviewStats) {
        return res.status(INTERNAL_SERVER_ERROR).send("ERROR");
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(OK).json(reviewStats);
}
