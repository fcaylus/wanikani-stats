import {NextApiRequest, NextApiResponse} from "next";
import WaniKaniApi from "../../src/server/WaniKaniApi";
import parseApiRequest from "../../src/server/parseApiRequest";
import {OK} from "http-status-codes";
import {User} from "../../src/data/interfaces/user";

/**
 * Fetch user data, and return a User object
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const requestParsedResult = await parseApiRequest(req, "GET");
    if (requestParsedResult.error) {
        return res.status(requestParsedResult.errorCode).send("ERROR " + requestParsedResult.errorCode.toString());
    }
    const apiKey = requestParsedResult.apiKey;

    // See: https://docs.api.wanikani.com/#user for endpoint documentation
    const wkResult = await WaniKaniApi(apiKey).get("user");

    if (wkResult.error || !wkResult.data || !wkResult.data.data) {
        return res.status(wkResult.errorCode).send("ERROR");
    }

    const data = wkResult.data.data;

    let user: User = {
        token: apiKey,
        username: data.username,
        maxLevel: data.subscription.max_level_granted,
        currentLevel: data.level,
        profileUrl: data.profile_url
    };

    res.setHeader("Content-Type", "application/json");
    return res.status(OK).json(user);
}
