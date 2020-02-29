import {NextApiRequest, NextApiResponse} from "next";
import {OK} from "http-status-codes";
import {isDownloading} from "../../src/data/dl/dl";

/**
 * Check if the WK subjects are downloaded and ready
 */
export default async (_req: NextApiRequest, res: NextApiResponse) => {
    if (isDownloading()) {
        return res.status(OK).json({
            status: "downloading"
        });
    } else {
        return res.status(OK).json({
            status: "ready"
        });
    }
}
