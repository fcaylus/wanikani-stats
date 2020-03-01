import {NextApiRequest, NextApiResponse} from "next";
import parseApiRequest from "../../../../src/server/parseApiRequest";
import {NOT_FOUND, OK} from "http-status-codes";
import {getStats} from "../../../../src/server/items";

/**
 * Return the stats for the specified item_type/source
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
    let {item_type, source} = req.query;
    source = source.toString();
    item_type = item_type.toString();

    const requestParsedResult = await parseApiRequest(req, "GET");
    if (requestParsedResult.error) {
        return res.status(requestParsedResult.errorCode).send(requestParsedResult.errorCode.toString());
    }

    // Get stats
    const stats = await getStats(source, item_type, requestParsedResult.apiKey);
    if (!stats) {
        return res.status(NOT_FOUND).send("NOT FOUND");
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(OK).json(stats);
}
