import {NextApiRequest, NextApiResponse} from "next";
import parseApiRequest from "../../../../src/server/parseApiRequest";
import {NOT_FOUND, OK} from "http-status-codes";
import {getItems} from "../../../../src/server/items";
import {isResourceTimedOut} from "../../../../src/server/WaniKaniApi";
import {ItemCategory} from "../../../../src/data/interfaces/item";

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
        return res.status(requestParsedResult.errorCode).send(requestParsedResult.errorCode.toString());
    }

    // Get items
    let items: ItemCategory[] | null;
    if (isResourceTimedOut(req.query["updated_after"])) {
        items = await getItems(source, item_type, requestParsedResult.apiKey);
        if (!items) {
            return res.status(NOT_FOUND).send("NOT FOUND");
        }
    } else {
        items = [];
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(OK).json(items);
}
