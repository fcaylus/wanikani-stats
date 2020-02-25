import {NextApiRequest, NextApiResponse} from "next";
import parseApiRequest from "../../src/server/parseApiRequest";
import {OK, UNAUTHORIZED} from "http-status-codes";
import {login} from "../../src/server/users";

/**
 * Challenge a login based on the user api key
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const requestParsedResult = await parseApiRequest(req, "GET", false);
    if (requestParsedResult.error) {
        return res.status(requestParsedResult.errorCode).send("ERROR " + requestParsedResult.errorCode.toString());
    }

    const result = await login(requestParsedResult.apiKey);

    if (!result) {
        return res.status(UNAUTHORIZED).send("UNAUTHORIZED");
    }

    return res.status(OK).send("LOGGED IN");
}
