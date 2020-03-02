import {NextApiRequest, NextApiResponse} from "next";
import parseApiRequest from "../../../src/server/parseApiRequest";
import {INTERNAL_SERVER_ERROR, OK} from "http-status-codes";
import {getAccuracy} from "../../../src/server/accuracy";

/**
 * Return an Accuracy object
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const requestParsedResult = await parseApiRequest(req, "GET");
    if (requestParsedResult.error) {
        return res.status(requestParsedResult.errorCode).send(requestParsedResult.errorCode.toString());
    }
    const apiKey = requestParsedResult.apiKey;

    const result = await getAccuracy(apiKey);

    if (!result) {
        return res.status(INTERNAL_SERVER_ERROR).send("ERROR");
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(OK).json(result);
}
