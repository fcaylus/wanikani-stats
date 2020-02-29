import {NextApiRequest, NextApiResponse} from "next";
import parseApiRequest from "../../src/server/parseApiRequest";
import {OK} from "http-status-codes";
import {logout} from "../../src/server/users";

/**
 * Logout the user
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const requestParsedResult = await parseApiRequest(req, "GET");
    if (requestParsedResult.error) {
        return res.status(requestParsedResult.errorCode).send(requestParsedResult.errorCode.toString());
    }

    logout(requestParsedResult.apiKey);

    return res.status(OK).send("LOGGED OUT");
}
