import {Status} from "../data/interfaces/status";
import {getUser} from "./users";

/**
 * Get the status of the user
 */
export const getStatus = async (token: string): Promise<Status | undefined> => {
    const user = await getUser(token);
    if (!user) {
        return undefined;
    }

    return {
        currentLevel: user.currentLevel,
        startDate: user.startDate
    };
};
