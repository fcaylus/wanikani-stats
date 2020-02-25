import {NextApiRequest, NextApiResponse} from "next";
import parseApiRequest from "../../../../src/server/parseApiRequest";
import {NOT_FOUND, OK} from "http-status-codes";
import {getItems} from "../../../../src/server/items";

/**
 * Return the list of items depending on the query parameters.
 * Most of the logic is inside the getItems() function.
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
    let {item_type, source} = req.query;
    source = source.toString();
    item_type = item_type.toString();

    const requestParsedResult = await parseApiRequest(req, "GET");
    if (requestParsedResult.error) {
        return res.status(requestParsedResult.errorCode).send("ERROR " + requestParsedResult.errorCode.toString());
    }

    // Get items
    const items = getItems(source, item_type);
    if (!items) {
        return res.status(NOT_FOUND).send("NOT FOUND");
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(OK).json(items);
}
